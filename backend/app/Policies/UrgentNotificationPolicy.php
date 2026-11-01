<?php

namespace App\Policies;

use App\Models\UrgentNotification;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UrgentNotificationPolicy
{
    use HandlesAuthorization;

    public function view(User $user, UrgentNotification $notification): bool
    {
        return $user->role === 'psychologist'
            && $notification->psychologist_id === $user->id;
    }

    public function acknowledge(User $user, UrgentNotification $notification): bool
    {
        return $this->view($user, $notification);
    }
}