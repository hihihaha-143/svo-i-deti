<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ConversationPolicy
{
    use HandlesAuthorization;

    public function view(User $user, Conversation $conversation): bool
    {
        if (! $conversation->hasParticipant($user->id)) {
            return false;
        }

        return $this->typeAllowedForUser($conversation, $user);
    }

    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }

    public function markRead(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }

    public function sendUrgent(User $user, Conversation $conversation): bool
    {
        if (! $this->view($user, $conversation)) {
            return false;
        }

        return $user->role === 'child'
            && $conversation->type === Conversation::TYPE_CHILD_PSYCHOLOGIST;
    }

    public function viewFlagged(User $user, Conversation $conversation): bool
    {
        if (! $this->view($user, $conversation)) {
            return false;
        }

        return $user->role === 'psychologist';
    }

    protected function typeAllowedForUser(Conversation $conversation, User $user): bool
    {
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
    }
}