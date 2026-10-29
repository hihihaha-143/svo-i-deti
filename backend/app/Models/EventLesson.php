<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventLesson extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'event_id',
        'lesson_number',
        'lesson_date',
    ];

    protected $casts = [
        'lesson_date' => 'date',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function attendance()
    {
        return $this->hasMany(EventAttendance::class);
    }
}