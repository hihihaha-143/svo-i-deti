<?php

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{conversationId}', function (User $user, int $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (! $conversation) {
        return false;
    }
    if (! $conversation->hasParticipant($user->id)) {
        return false;
    }
    return match ($user->role) {
        'child' => in_array($conversation->type, [
            Conversation::TYPE_CHILD_PSYCHOLOGIST,
            Conversation::TYPE_CHILD_MENTOR,
        ], true),
        'psychologist' => in_array($conversation->type, [
            Conversation::TYPE_CHILD_PSYCHOLOGIST,
            Conversation::TYPE_PARENT_PSYCHOLOGIST,
        ], true),
        'mentor' => $conversation->type === Conversation::TYPE_CHILD_MENTOR,
        'parent' => $conversation->type === Conversation::TYPE_PARENT_PSYCHOLOGIST,
        default => false,
    };
});

Broadcast::channel('user.{userId}', function (User $user, int $userId) {
    return $user->id === $userId;
});