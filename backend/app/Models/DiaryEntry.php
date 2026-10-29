<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiaryEntry extends Model
{
    protected $fillable = [
        'child_id',
        'parent_id',
        'event',
        'text',
    ];

    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    public function parent()
    {
        return $this->belongsTo(ParentModel::class, 'parent_id');
    }
}