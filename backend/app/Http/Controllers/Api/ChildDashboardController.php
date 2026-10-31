<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\Child;
use App\Models\ChildAchievement;
use App\Models\ChildSuperpower;
use App\Models\MoodEntry;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChildDashboardController extends Controller
{
    private function getChild(Request $request): ?Child
    {
        return Child::where('user_id', $request->user()->id)->first();
    }

    public function tests(Request $request)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        $tests = Test::where('is_active', true)
            ->whereIn('for_whom', ['child', 'both'])
            ->get()
            ->map(function ($test) use ($child) {
                $attempt = TestAttempt::where('test_id', $test->id)
                    ->where('user_id', $child->user_id)
                    ->where('is_completed', true)
                    ->exists();

                return [
                    'id' => $test->id,
                    'title' => $test->title,
                    'is_passed' => $attempt,
                ];
            });

        return response()->json([
            'data' => $tests,
            'stars' => (int) $child->stars,
        ]);
    }

    public function todayMood(Request $request)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        $entry = MoodEntry::where('child_id', $child->id)
            ->whereDate('date', now()->toDateString())
            ->first();

        return response()->json([
            'data' => [
                'mood' => $entry?->mood,
                'star_earned' => $entry !== null,
            ],
        ]);
    }

    public function storeMood(Request $request)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        $validated = $request->validate([
            'mood' => ['required', 'in:good,normal,bad'],
        ]);

        $today = now()->toDateString();

        $entry = MoodEntry::where('child_id', $child->id)
            ->whereDate('date', $today)
            ->first();

        $starEarned = false;

        DB::transaction(function () use ($child, $validated, $today, &$entry, &$starEarned) {
            if ($entry) {
                $entry->update(['mood' => $validated['mood']]);
            } else {
                MoodEntry::create([
                    'child_id' => $child->id,
                    'date' => $today,
                    'mood' => $validated['mood'],
                ]);
                $child->increment('stars', 1);
                $starEarned = true;
            }
        });

        return response()->json([
            'message' => $starEarned ? 'Настроение сохранено! +1 звезда' : 'Настроение обновлено',
            'stars' => (int) $child->fresh()->stars,
            'star_earned' => $starEarned,
            'mood' => $validated['mood'],
        ]);
    }

    public function changeTheme(Request $request)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        $validated = $request->validate([
            'theme' => ['required', 'in:mint,ocean,duck,space'],
        ]);

        $newlyEarnedIds = [];

        $id = $this->award($child, 'first_theme_change');
        if ($id !== null) $newlyEarnedIds[] = $id;

        $newlyEarned = Achievement::whereIn('id', $newlyEarnedIds)
            ->where('is_hidden', false)
            ->get()
            ->map(function ($ach) {
                return [
                    'id' => $ach->id,
                    'title' => $ach->title,
                    'icon' => $ach->icon,
                    'stars_reward' => $ach->stars_reward,
                ];
            });

        return response()->json([
            'message' => 'Тема изменена',
            'theme' => $validated['theme'],
            'stars' => (int) $child->fresh()->stars,
            'newly_earned' => $newlyEarned,
        ]);
    }

    public function achievements(Request $request)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        $newlyEarnedIds = $this->checkAchievements($child);

        $all = Achievement::where('is_hidden', false)->orderBy('id')->get();
        $earnedIds = ChildAchievement::where('child_id', $child->id)
            ->pluck('achievement_id')
            ->toArray();

        $items = $all->map(function ($ach) use ($earnedIds) {
            return [
                'id' => $ach->id,
                'code' => $ach->code,
                'title' => $ach->title,
                'icon' => $ach->icon,
                'description' => $ach->description,
                'stars_reward' => $ach->stars_reward,
                'is_hidden' => $ach->is_hidden,
                'is_earned' => in_array($ach->id, $earnedIds, true),
            ];
        });

        $newlyEarned = Achievement::whereIn('id', $newlyEarnedIds)
            ->where('is_hidden', false)
            ->get()
            ->map(function ($ach) {
                return [
                    'id' => $ach->id,
                    'title' => $ach->title,
                    'icon' => $ach->icon,
                    'stars_reward' => $ach->stars_reward,
                ];
            });

        return response()->json([
            'data' => $items,
            'earned_count' => count($earnedIds),
            'total_count' => $all->count(),
            'newly_earned' => $newlyEarned,
            'stars' => (int) $child->fresh()->stars,
        ]);
    }

    public function stats(Request $request)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        // Проверяем достижения за суперсилы
        $newlyEarnedIds = $this->checkAchievements($child);

        // 1. Основные счётчики
        $messagesSent = 0; // чата пока нет
        $urgentMessages = 0; // чата пока нет
        $testsPassed = TestAttempt::where('user_id', $child->user_id)
            ->where('is_completed', true)
            ->count();
        $achievementsEarned = ChildAchievement::where('child_id', $child->id)->count();
        $colorings = 0; // раскрасок пока нет
        $starsTotal = (int) $child->stars;

        // 2. Настроения
        $moodCounts = MoodEntry::where('child_id', $child->id)
            ->selectRaw('mood, COUNT(*) as cnt')
            ->groupBy('mood')
            ->pluck('cnt', 'mood');

        $moodsTotal = MoodEntry::where('child_id', $child->id)->count();

        // Дней подряд
        $dates = MoodEntry::where('child_id', $child->id)
            ->orderByDesc('date')
            ->pluck('date')
            ->map(fn($d) => \Carbon\Carbon::parse($d)->toDateString())
            ->unique()
            ->values()
            ->toArray();

        $streak = 0;
        $checkDate = now()->toDateString();
        foreach ($dates as $d) {
            if ($d === $checkDate) {
                $streak++;
                $checkDate = \Carbon\Carbon::parse($d)->subDay()->toDateString();
            } else {
                break;
            }
        }

        $lastMoodDate = $dates[0] ?? null;

        // 3. Суперсилы
        $superpowers = ChildSuperpower::where('child_id', $child->user_id)->first();
        $qualities = [];
        foreach (ChildSuperpower::QUALITIES as $key => $label) {
            $qualities[] = [
                'key' => $key,
                'label' => $label,
                'value' => $superpowers ? (int) $superpowers->{$key} : 0,
                'max' => 10,
            ];
        }

        return response()->json([
            'data' => [
                'messages_sent' => $messagesSent,
                'urgent_messages' => $urgentMessages,
                'tests_passed' => $testsPassed,
                'achievements_earned' => $achievementsEarned,
                'colorings' => $colorings,
                'stars_total' => $starsTotal,
                'moods' => [
                    'good' => (int) ($moodCounts['good'] ?? 0),
                    'normal' => (int) ($moodCounts['normal'] ?? 0),
                    'bad' => (int) ($moodCounts['bad'] ?? 0),
                    'total' => $moodsTotal,
                    'streak' => $streak,
                    'last_date' => $lastMoodDate,
                ],
                'superpowers' => $qualities,
            ],
            'newly_earned' => Achievement::whereIn('id', $newlyEarnedIds)
                ->where('is_hidden', false)
                ->get()
                ->map(fn($a) => [
                    'id' => $a->id,
                    'title' => $a->title,
                    'icon' => $a->icon,
                    'stars_reward' => $a->stars_reward,
                ]),
            'stars' => (int) $child->fresh()->stars,
        ]);
    }

    private function checkAchievements(Child $child): array
    {
        $newlyEarned = [];

        // 1. Достижения за длительность настроения
        $moodDays = MoodEntry::where('child_id', $child->id)
            ->distinct('date')
            ->count('date');

        $moodAchievements = [
            'mood_week'    => 7,
            'mood_month'   => 30,
            'mood_90_days' => 90,
            'mood_year'    => 350,
        ];

        foreach ($moodAchievements as $code => $daysRequired) {
            if ($moodDays >= $daysRequired) {
                $id = $this->award($child, $code);
                if ($id !== null) $newlyEarned[] = $id;
            }
        }

        // 2. Скрытые достижения за неделю конкретного настроения
        $last7 = MoodEntry::where('child_id', $child->id)
            ->whereDate('date', '>=', now()->subDays(6)->toDateString())
            ->orderBy('date')
            ->get();

        if ($last7->count() >= 7) {
            $moods = $last7->pluck('mood')->toArray();
            if (count(array_unique($moods)) === 1) {
                $mood = $moods[0];
                $map = [
                    'good'   => 'week_good_mood',
                    'normal' => 'week_normal_mood',
                    'bad'    => 'week_bad_mood',
                ];
                if (isset($map[$mood])) {
                    $id = $this->award($child, $map[$mood]);
                    if ($id !== null) $newlyEarned[] = $id;
                }
            }
        }

        // 3. Достижения за суперсилы на 10
        $superpowers = ChildSuperpower::where('child_id', $child->user_id)->first();
        if ($superpowers) {
            $allMax = true;
            foreach (array_keys(ChildSuperpower::QUALITIES) as $key) {
                if ((int) $superpowers->{$key} >= 10) {
                    $id = $this->award($child, 'superpower_max_' . $key);
                    if ($id !== null) $newlyEarned[] = $id;
                } else {
                    $allMax = false;
                }
            }

            if ($allMax) {
                $id = $this->award($child, 'all_superpowers_max');
                if ($id !== null) $newlyEarned[] = $id;
            }
        }

        return $newlyEarned;
    }

    private function award(Child $child, string $code): ?int
    {
        $achievement = Achievement::where('code', $code)->first();
        if (!$achievement) return null;

        $already = ChildAchievement::where('child_id', $child->id)
            ->where('achievement_id', $achievement->id)
            ->exists();

        if ($already) return null;

        DB::transaction(function () use ($child, $achievement) {
            ChildAchievement::create([
                'child_id' => $child->id,
                'achievement_id' => $achievement->id,
                'received_at' => now(),
            ]);

            if ($achievement->stars_reward > 0) {
                $child->increment('stars', $achievement->stars_reward);
            }
        });

        return $achievement->id;
    }
}