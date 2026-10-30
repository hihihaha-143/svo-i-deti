<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestAttempt extends Model
{
    protected $fillable = [
        'test_id',
        'user_id',
        'started_at',
        'finished_at',
        'score',
        'result_json',
        'is_completed',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'result_json' => 'array',
        'is_completed' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::created(function (TestAttempt $attempt) {
            if (!$attempt->is_completed) {
                return;
            }

            $ids = static::query()
                ->where('user_id', $attempt->user_id)
                ->where('test_id', $attempt->test_id)
                ->where('is_completed', true)
                ->orderByDesc('finished_at')
                ->orderByDesc('id')
                ->pluck('id')
                ->all();

            $toDelete = array_slice($ids, 2);

            if (!empty($toDelete)) {
                static::query()->whereIn('id', $toDelete)->delete();
            }
        });
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(TestAnswer::class, 'attempt_id');
    }
}