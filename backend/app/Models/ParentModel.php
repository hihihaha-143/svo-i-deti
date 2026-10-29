<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParentModel extends Model
{
    use HasFactory;

    protected $table = 'parents';

    protected $fillable = [
        'user_id',
        'psychologist_id',
        'mentor_id',
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

    public function children()
    {
        return $this->hasMany(Child::class);
    }
}