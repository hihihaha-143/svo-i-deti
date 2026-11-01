<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userId = $request->user()->id;
        $interlocutor = $this->interlocutorFor($userId);

        $read = $this->reads->firstWhere('user_id', $userId);
        $lastReadAt = $read?->last_read_at;

        $unreadCount = $this->messages()
            ->where('sender_id', '!=', $userId)
            ->when($lastReadAt, fn ($q) => $q->where('created_at', '>', $lastReadAt))
            ->count();

        $hasUrgent = $this->messages()
            ->where('is_urgent', true)
            ->when($lastReadAt, fn ($q) => $q->where('created_at', '>', $lastReadAt))
            ->exists();

        return [
            'id' => $this->id,
            'type' => $this->type,
            'interlocutor' => $interlocutor ? [
                'id' => $interlocutor->id,
                'name' => $interlocutor->name,
                'role' => $interlocutor->role,
            ] : null,
            'last_message_preview' => $this->last_message_preview,
            'last_message_at' => $this->last_message_at?->toIso8601String(),
            'unread_count' => $unreadCount,
            'has_urgent' => $hasUrgent,
            'is_archived' => (bool) $this->is_archived,
        ];
    }
}