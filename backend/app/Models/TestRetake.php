<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestRetake extends Model
{
    protected $table = 'test_retakes';

    protected $fillable = [
        'child_id',
        'test_id',
        'allowed_at',
    ];

    protected $casts = [
        'child_id' => 'integer',
        'test_id' => 'integer',
        'allowed_at' => 'datetime',
    ];

    public function child()
    {
        return $this->belongsTo(User::class, 'child_id');
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }
}