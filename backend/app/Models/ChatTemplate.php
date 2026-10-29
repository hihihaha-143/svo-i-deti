<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatTemplate extends Model
{
    protected $fillable = ['category_id', 'name', 'text', 'usage_count'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ChatTemplateCategory::class, 'category_id');
    }
}