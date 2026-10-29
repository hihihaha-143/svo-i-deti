<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventAttendance extends Model
{
    protected $table = 'event_attendance';

    public $timestamps = false;

    protected $fillable = [
        'event_lesson_id',
        'child_id',
        'attended',
    ];

    protected $casts = [
        'attended' => 'boolean',
    ];

    public function lesson()
    {
        return $this->belongsTo(EventLesson::class, 'event_lesson_id');
    }

    public function child()
    {
        return $this->belongsTo(Child::class);
    }
}