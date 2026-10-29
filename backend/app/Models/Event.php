<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'psychologist_id',
        'mentor_id',
        'title',
        'type',
        'lessons_count',
        'start_date',
        'description',
        'schedule_type',
        'schedule_interval',
        'schedule_day_of_week',
    ];

    protected $casts = [
        'start_date' => 'date',
    ];

    public function psychologist()
    {
        return $this->belongsTo(Psychologist::class);
    }

    public function mentor()
    {
        return $this->belongsTo(Mentor::class);
    }

    public function children()
    {
        return $this->belongsToMany(Child::class, 'event_children', 'event_id', 'child_id');
    }

    public function lessons()
    {
        return $this->hasMany(EventLesson::class)->orderBy('lesson_number');
    }
}