<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Test extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'psychologist_id',
        'title',
        'for_whom',
        'description',
        'age_restrictions',
        'motivation_text',
        'coloring_file',
        'is_active',
        'is_monthly',
        'created_by',
    ];

    protected $casts = [
        'age_restrictions' => 'array',
        'is_active' => 'boolean',
        'is_monthly' => 'boolean',
    ];

    public function psychologist()
    {
        return $this->belongsTo(Psychologist::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function attempts()
    {
        return $this->hasMany(TestAttempt::class);
    }
}