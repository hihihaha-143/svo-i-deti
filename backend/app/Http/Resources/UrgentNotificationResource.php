<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UrgentNotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message_id' => $this->message_id,
            'conversation_id' => $this->conversation_id,
            'child_id' => $this->child_id,
            'psychologist_id' => $this->psychologist_id,
            'is_acknowledged' => (bool) $this->is_acknowledged,
            'acknowledged_at' => $this->acknowledged_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'message' => new MessageResource($this->whenLoaded('message')),
            'child' => $this->whenLoaded('child', fn () => [
                'id' => $this->child->id,
                'name' => $this->child->name,
            ]),
        ];
    }
}