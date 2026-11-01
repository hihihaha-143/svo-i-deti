<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    public const TYPE_CHILD_PSYCHOLOGIST = 'child_psychologist';
    public const TYPE_CHILD_MENTOR = 'child_mentor';
    public const TYPE_PARENT_PSYCHOLOGIST = 'parent_psychologist';

    protected $fillable = [
        'type',
        'child_id',
        'participant_one_id',
        'participant_two_id',
        'last_message_at',
        'last_message_preview',
        'is_archived',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'is_archived' => 'boolean',
    ];

    public function child(): BelongsTo
    {
        return $this->belongsTo(User::class, 'child_id');
    }

    public function participantOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_one_id');
    }

    public function participantTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_two_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function reads(): HasMany
    {
        return $this->hasMany(ConversationUserRead::class);
    }

    public function urgentNotifications(): HasMany
    {
        return $this->hasMany(UrgentNotification::class);
    }

    public function hasParticipant(int $userId): bool
    {
        return $this->participant_one_id === $userId || $this->participant_two_id === $userId;
    }

    public function interlocutorFor(int $userId): ?User
    {
        if ($this->participant_one_id === $userId) {
            return $this->participantTwo;
        }
        if ($this->participant_two_id === $userId) {
            return $this->participantOne;
        }
        return null;
    }
}