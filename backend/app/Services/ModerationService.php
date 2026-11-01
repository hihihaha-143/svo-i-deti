<?php

namespace App\Services;

class ModerationService
{
    /**
     * Возвращает true, если текст содержит опасный контент.
     */
    public function isFlagged(string $body): bool
    {
        $haystack = mb_strtolower($body, 'UTF-8');

        foreach (config('moderation.keywords', []) as $keyword) {
            if ($keyword === '') {
                continue;
            }
            if (mb_strpos($haystack, mb_strtolower($keyword, 'UTF-8')) !== false) {
                return true;
            }
        }

        return false;
    }
}