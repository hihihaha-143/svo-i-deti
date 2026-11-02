<?php

namespace App\Http\Controllers\Api;

use App\Events\ConversationRead;
use App\Events\MessageSent;
use App\Events\UrgentNotificationCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\MarkReadRequest;
use App\Http\Requests\StoreConversationRequest;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\ConversationUserRead;
use App\Models\Message;
use App\Models\UrgentNotification;
use App\Services\ModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ConversationController extends Controller
{
   public function index(Request $request)
{
    $user = $request->user();

    $conversations = Conversation::query()
        ->where(function ($q) use ($user) {
            $q->where('participant_one_id', $user->id)
              ->orWhere('participant_two_id', $user->id);
        })
        ->with(['participantOne', 'participantTwo', 'reads'])
        ->orderByDesc('last_message_at')
        ->get();

    $data = $conversations->map(function (Conversation $c) use ($user) {
        $interlocutor = $c->participant_one_id === $user->id
            ? $c->participantTwo
            : $c->participantOne;

        $read = $c->reads->firstWhere('user_id', $user->id);
        $lastReadAt = $read?->last_read_at;

        $unreadCount = \App\Models\Message::where('conversation_id', $c->id)
            ->where('sender_id', '!=', $user->id)
            ->when($lastReadAt, fn ($q) => $q->where('created_at', '>', $lastReadAt))
            ->count();

        $hasUrgent = \App\Models\Message::where('conversation_id', $c->id)
            ->where('is_urgent', true)
            ->when($lastReadAt, fn ($q) => $q->where('created_at', '>', $lastReadAt))
            ->exists();

        return [
            'id' => $c->id,
            'type' => $c->type,
            'interlocutor' => $interlocutor ? [
                'id' => $interlocutor->id,
                'name' => $interlocutor->name,
                'role' => $interlocutor->role,
            ] : null,
            'last_message_preview' => $c->last_message_preview,
            'last_message_at' => $c->last_message_at?->toIso8601String(),
            'unread_count' => $unreadCount,
            'has_urgent' => $hasUrgent,
            'is_archived' => (bool) $c->is_archived,
        ];
    });

    return response()->json(['data' => $data]);
}

    public function store(StoreConversationRequest $request)
    {
        $user = $request->user();
        $type = $request->input('type');
        $participantId = (int) $request->input('participant_id');

        $childId = null;
        if ($user->role === 'child') {
            $childId = $user->id;
        } elseif ($user->role === 'parent') {
            $childId = $user->child_id ?? null;
        }

        if (! $childId) {
            return response()->json(['message' => 'Не удалось определить ребёнка'], 422);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'type' => $type,
                'participant_one_id' => min($user->id, $participantId),
                'participant_two_id' => max($user->id, $participantId),
            ],
            [
                'child_id' => $childId,
            ]
        );

        if (! Gate::forUser($user)->allows('view', $conversation)) {
            return response()->json(['message' => 'Недопустимый диалог'], 403);
        }

        $conversation->load(['participantOne', 'participantTwo', 'reads']);

        return new ConversationResource($conversation);
    }

    public function messages(Request $request, Conversation $conversation)
    {
        Gate::forUser($request->user())->authorize('view', $conversation);

        $limit = (int) $request->query('limit', 50);
        $limit = max(1, min($limit, 100));
        $beforeId = $request->query('before_id');

        $query = Message::where('conversation_id', $conversation->id)
            ->orderByDesc('id')
            ->limit($limit);

        if ($beforeId) {
            $query->where('id', '<', (int) $beforeId);
        }

        $messages = $query->get()->sortBy('id')->values();

        return MessageResource::collection($messages);
    }

    public function sendMessage(
        StoreMessageRequest $request,
        Conversation $conversation,
        ModerationService $moderation
    ) {
        Gate::forUser($request->user())->authorize('sendMessage', $conversation);

        $user = $request->user();
        $body = $request->input('body');
        $isUrgent = (bool) $request->input('is_urgent', false);

        if ($isUrgent && ! Gate::forUser($user)->allows('sendUrgent', $conversation)) {
            return response()->json(['message' => 'Срочные сообщения недоступны'], 403);
        }

        $isFlagged = $moderation->isFlagged($body);

        [$message, $urgentNotification] = DB::transaction(function () use ($conversation, $user, $body, $isUrgent, $isFlagged) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'body' => $body,
                'is_urgent' => $isUrgent,
                'is_flagged' => $isFlagged,
            ]);

            $conversation->update([
                'last_message_at' => $message->created_at,
                'last_message_preview' => mb_substr($body, 0, 255),
            ]);

            $notification = null;

            if ($isUrgent || $isFlagged) {
                $psychologistId = $this->resolvePsychologistId($conversation);
                if ($psychologistId) {
                    $notification = UrgentNotification::create([
                        'message_id' => $message->id,
                        'conversation_id' => $conversation->id,
                        'child_id' => $conversation->child_id,
                        'psychologist_id' => $psychologistId,
                        'is_acknowledged' => false,
                    ]);
                }
            }

            return [$message, $notification];
        });

        $message->load('sender');

        broadcast(new MessageSent($message))->toOthers();

        if ($urgentNotification) {
            $urgentNotification->load(['message', 'child']);
            broadcast(new UrgentNotificationCreated($urgentNotification));
        }

        return new MessageResource($message);
    }

    public function markRead(MarkReadRequest $request, Conversation $conversation)
    {
        Gate::forUser($request->user())->authorize('markRead', $conversation);

        $user = $request->user();
        $lastMessageId = (int) $request->input('last_message_id');

        $message = Message::where('conversation_id', $conversation->id)
            ->where('id', $lastMessageId)
            ->first();

        if (! $message) {
            return response()->json(['message' => 'Сообщение не найдено в этом чате'], 422);
        }

        ConversationUserRead::updateOrCreate(
            ['conversation_id' => $conversation->id, 'user_id' => $user->id],
            ['last_read_at' => $message->created_at, 'last_read_message_id' => $message->id]
        );

        broadcast(new ConversationRead(
            $conversation->id,
            $user->id,
            $message->id,
            $message->created_at->toIso8601String(),
        ))->toOthers();

        return response()->json(['ok' => true]);
    }

    protected function resolvePsychologistId(Conversation $conversation): ?int
    {
        if ($conversation->type === Conversation::TYPE_CHILD_PSYCHOLOGIST) {
            return $conversation->participant_one_id === $conversation->child_id
                ? $conversation->participant_two_id
                : $conversation->participant_one_id;
        }

        if ($conversation->type === Conversation::TYPE_PARENT_PSYCHOLOGIST) {
            $conversation->loadMissing(['participantOne', 'participantTwo']);
            return $conversation->participantOne?->role === 'psychologist'
                ? $conversation->participant_one_id
                : $conversation->participant_two_id;
        }

        return null;
    }
}