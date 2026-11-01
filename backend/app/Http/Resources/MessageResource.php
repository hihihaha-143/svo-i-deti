<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $showFlag = $user && $user->role === 'psychologist';

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'body' => $this->body,
            'is_urgent' => (bool) $this->is_urgent,
            'is_flagged' => $showFlag ? (bool) $this->is_flagged : false,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}