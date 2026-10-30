<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\Event;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class MentorDashboardController extends Controller
{
    public function index(Request $request)
    {
        $mentor = $request->user()->mentor;

        if (!$mentor) {
            return response()->json(['message' => 'Профиль наставника не найден'], 403);
        }

        $childrenIds = Child::where('mentor_id', $mentor->id)->pluck('id');

        $childrenCount = $childrenIds->count();

        // Дети онлайн (по токенам за 5 минут)
        $fiveMinutesAgo = now()->subMinutes(5);

        $onlineChildren = PersonalAccessToken::where('last_used_at', '>=', $fiveMinutesAgo)
            ->whereHas('tokenable', function ($query) use ($childrenIds) {
                $query->where('role', 'child')
                    ->whereHas('child', function ($q) use ($childrenIds) {
                        $q->whereIn('id', $childrenIds);
                    });
            })->count();

        // Записи настроений за последние 7 дней по его детям
        $moodEntriesWeek = \App\Models\MoodEntry::whereIn('child_id', $childrenIds)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        // Мероприятия, в которых участвуют его дети
        $eventsCount = Event::whereHas('children', function ($q) use ($childrenIds) {
            $q->whereIn('children.id', $childrenIds);
        })->count();

        return response()->json([
            'data' => [
                'children' => $childrenCount,
                'online_children' => $onlineChildren,
                'mood_entries_week' => $moodEntriesWeek,
                'events' => $eventsCount,
            ]
        ]);
    }
}