<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChildAchievement extends Model
{
    protected $fillable = [
        'child_id',
        'achievement_id',
        'received_at',
    ];

    protected $casts = [
        'received_at' => 'datetime',
    ];

    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    public function achievement()
    {
        return $this->belongsTo(Achievement::class);
    }
}