<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MoodEntry extends Model
{
    protected $fillable = [
        'child_id',
        'date',
        'mood',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function child()
    {
        return $this->belongsTo(Child::class);
    }
}