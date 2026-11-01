<?php

namespace App\Events;

use App\Http\Resources\UrgentNotificationResource;
use App\Models\UrgentNotification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UrgentNotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public UrgentNotification $notification)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->notification->psychologist_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'UrgentNotificationCreated';
    }

    public function broadcastWith(): array
    {
        return [
            'notification' => (new UrgentNotificationResource(
                $this->notification->loadMissing(['message', 'child'])
            ))->resolve(),
        ];
    }
}