<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'psychologist_id',
        'mentor_id',
        'parent_id',
        'stars',
        'theme',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function psychologist()
    {
        return $this->belongsTo(Psychologist::class);
    }

    public function mentor()
    {
        return $this->belongsTo(Mentor::class);
    }

    public function parent()
    {
        return $this->belongsTo(ParentModel::class, 'parent_id');
    }
}