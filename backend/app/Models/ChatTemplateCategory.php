<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatTemplateCategory extends Model
{
    protected $fillable = ['name'];

    public function templates(): HasMany
    {
        return $this->hasMany(ChatTemplate::class, 'category_id');
    }
}