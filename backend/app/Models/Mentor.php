<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mentor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'psychologist_id',
        'organization',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function psychologist()
    {
        return $this->belongsTo(Psychologist::class);
    }

    public function parents()
    {
        return $this->hasMany(ParentModel::class);
    }

    public function children()
    {
        return $this->hasMany(Child::class);
    }
}