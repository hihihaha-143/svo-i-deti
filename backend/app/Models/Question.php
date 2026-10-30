<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = [
        'test_id',
        'question_text',
        'type',
        'order',
        'options',
        'scale_min_label',
        'scale_max_label',
        'allow_skip',
        'age_restrictions',
    ];

    protected $casts = [
        'options' => 'array',
        'age_restrictions' => 'array',
        'allow_skip' => 'boolean',
    ];

    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function answers()
    {
        return $this->hasMany(TestAnswer::class);
    }
}