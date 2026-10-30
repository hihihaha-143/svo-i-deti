<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChildSuperpower extends Model
{
    use HasFactory;

    protected $table = 'child_superpowers';

    protected $fillable = [
        'child_id',
        'independence',
        'emotional_sphere',
        'responsibility',
        'creativity',
        'organization',
        'sociability',
        'social_activity',
        'willpower',
    ];

    protected $casts = [
        'child_id' => 'integer',
        'independence' => 'integer',
        'emotional_sphere' => 'integer',
        'responsibility' => 'integer',
        'creativity' => 'integer',
        'organization' => 'integer',
        'sociability' => 'integer',
        'social_activity' => 'integer',
        'willpower' => 'integer',
    ];

    /**
     * Фиксированный список качеств («суперсил»).
     * Ключ — имя колонки в таблице child_superpowers, значение — русское название.
     * Иконки подбираются на фронте (lucide-react) по ключу.
     */
    public const QUALITIES = [
        'independence' => 'Самостоятельность',
        'emotional_sphere' => 'Эмоциональная сфера',
        'responsibility' => 'Ответственность',
        'creativity' => 'Креативность',
        'organization' => 'Организованность',
        'sociability' => 'Общительность',
        'social_activity' => 'Социальная активность',
        'willpower' => 'Сила воли',
    ];

    public function child(): BelongsTo
    {
        return $this->belongsTo(User::class, 'child_id');
    }
}