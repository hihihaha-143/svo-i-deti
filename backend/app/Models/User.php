<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'login',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function psychologist()
    {
        return $this->hasOne(Psychologist::class);
    }

    public function mentor()
    {
        return $this->hasOne(Mentor::class);
    }

    public function parent()
    {
        return $this->hasOne(ParentModel::class);
    }

    public function child()
    {
        return $this->hasOne(Child::class);
    }

        public function superpowers()
    {
        return $this->hasOne(ChildSuperpower::class, 'child_id');
    }
}