<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = [
        'code',
        'title',
        'icon',
        'description',
        'stars_reward',
        'is_hidden',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
        'stars_reward' => 'integer',
    ];

    public function childAchievements()
    {
        return $this->hasMany(ChildAchievement::class);
    }
}