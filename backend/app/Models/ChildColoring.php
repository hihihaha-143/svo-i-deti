<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChildColoring extends Model
{
    protected $fillable = [
        'child_id',
        'coloring_key',
    ];

    public function child()
    {
        return $this->belongsTo(Child::class);
    }
}
