<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParentMaterial extends Model
{
    protected $fillable = [
        'title',
        'preview',
        'content',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];
}