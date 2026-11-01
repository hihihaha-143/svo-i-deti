<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\Child;
use App\Models\ChildAchievement;
use App\Models\ChildSuperpower;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\MoodEntry;
use App\Models\Test;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestRetake;
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
            'theme' => $child->theme ?: 'mint',
        ]);
    }

    public function startTest(Request $request, $testId)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        $test = Test::where('is_active', true)
            ->whereIn('for_whom', ['child', 'both'])
            ->with('questions')
            ->findOrFail($testId);

        $completedAttempt = TestAttempt::where('test_id', $test->id)
            ->where('user_id', $child->user_id)
            ->where('is_completed', true)
            ->first();

        if ($completedAttempt) {
            $retake = TestRetake::where('child_id', $child->id)
                ->where('test_id', $test->id)
                ->first();

            if (!$retake) {
                return response()->json(['message' => 'Тест уже пройден'], 409);
            }
        }

        $attempt = TestAttempt::where('test_id', $test->id)
            ->where('user_id', $child->user_id)
            ->where('is_completed', false)
            ->first();

        if (!$attempt) {
            $attempt = TestAttempt::create([
                'test_id' => $test->id,
                'user_id' => $child->user_id,
                'is_completed' => false,
            ]);
        }

        $luscherColors = [
            ['value' => 'blue', 'text' => 'Синий', 'hex' => '#1E63B5'],
            ['value' => 'green', 'text' => 'Зелёный', 'hex' => '#1E7A3C'],
            ['value' => 'red', 'text' => 'Красный', 'hex' => '#C0392B'],
            ['value' => 'yellow', 'text' => 'Жёлтый', 'hex' => '#F1C40F'],
            ['value' => 'purple', 'text' => 'Фиолетовый', 'hex' => '#7D3C98'],
            ['value' => 'brown', 'text' => 'Коричневый', 'hex' => '#795548'],
            ['value' => 'black', 'text' => 'Чёрный', 'hex' => '#1C1C1C'],
            ['value' => 'gray', 'text' => 'Серый', 'hex' => '#9E9E9E'],
        ];

        return response()->json([
            'data' => [
                'attempt_id' => $attempt->id,
                'test' => [
                    'id' => $test->id,
                    'title' => $test->title,
                    'description' => $test->description,
                    'motivation_text' => $test->motivation_text,
                    'coloring_file_url' => $test->coloring_file ? \Storage::url($test->coloring_file) : null,
                    'questions' => $test->questions->map(function ($q) use ($luscherColors) {
                        $options = $q->options;
                        if ($q->type === 'luscher') {
                            $options = $luscherColors;
                        }
                        return [
                            'id' => $q->id,
                            'question_text' => $q->question_text,
                            'type' => $q->type,
                            'order' => $q->order,
                            'options' => $options,
                            'scale_min_label' => $q->scale_min_label,
                            'scale_max_label' => $q->scale_max_label,
                            'allow_skip' => $q->allow_skip,
                        ];
                    })->sortBy('order')->values(),
                ],
            ],
        ]);
    }

    public function answerTest(Request $request, $testId)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        $validated = $request->validate([
            'attempt_id' => ['required', 'integer'],
            'question_id' => ['required', 'integer'],
            'value_json' => ['required'],
        ]);

        $attempt = TestAttempt::where('id', $validated['attempt_id'])
            ->where('test_id', $testId)
            ->where('user_id', $child->user_id)
            ->where('is_completed', false)
            ->firstOrFail();

        TestAnswer::updateOrCreate(
            [
                'attempt_id' => $attempt->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'value_json' => $validated['value_json'],
            ]
        );

        return response()->json(['message' => 'Ответ сохранён']);
    }

    public function finishTest(Request $request, $testId)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        $validated = $request->validate([
            'attempt_id' => ['required', 'integer'],
        ]);

        $attempt = TestAttempt::where('id', $validated['attempt_id'])
            ->where('test_id', $testId)
            ->where('user_id', $child->user_id)
            ->where('is_completed', false)
            ->firstOrFail();

        $score = TestAnswer::where('attempt_id', $attempt->id)->count();

        DB::transaction(function () use ($attempt, $child, $score) {
            $attempt->update([
                'is_completed' => true,
                'finished_at' => now(),
                'score' => $score,
            ]);

            $child->increment('stars', 3);

            TestRetake::where('child_id', $child->id)
                ->where('test_id', $attempt->test_id)
                ->delete();
        });

        $newlyEarnedIds = $this->checkAchievements($child);

        $test = Test::find($testId);

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
            'message' => 'Тест завершён',
            'data' => [
                'attempt_id' => $attempt->id,
                'motivation_text' => $test?->motivation_text ?? 'Молодец, что прошёл тест!',
                'stars_earned' => 3,
                'stars_total' => (int) $child->fresh()->stars,
                'newly_earned' => $newlyEarned,
            ],
        ]);
    }

    public function colorings(Request $request)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        $colorings = Test::where('is_active', true)
            ->whereIn('for_whom', ['child', 'both'])
            ->whereNotNull('coloring_file')
            ->get()
            ->map(function ($test) {
                return [
                    'id' => $test->id,
                    'title' => $test->title,
                    'url' => \Storage::url($test->coloring_file),
                ];
            });

        return response()->json(['data' => $colorings]);
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

        $child->update(['theme' => $validated['theme']]);

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

        $newlyEarnedIds = $this->checkAchievements($child);

        $messagesSent = 0;
        $urgentMessages = 0;
        $testsPassed = TestAttempt::where('user_id', $child->user_id)
            ->where('is_completed', true)
            ->count();
        $achievementsEarned = ChildAchievement::where('child_id', $child->id)->count();
        $colorings = \App\Models\ChildColoring::where('child_id', $child->id)->count();
        $starsTotal = (int) $child->stars;

        $moodCounts = MoodEntry::where('child_id', $child->id)
            ->selectRaw('mood, COUNT(*) as cnt')
            ->groupBy('mood')
            ->pluck('cnt', 'mood');

        $moodsTotal = MoodEntry::where('child_id', $child->id)->count();

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

    public function events(Request $request)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        $events = Event::whereHas('children', function ($q) use ($child) {
            $q->where('children.id', $child->id);
        })
            ->with(['lessons' => function ($q) {
                $q->orderBy('lesson_number');
            }])
            ->orderByDesc('start_date')
            ->get();

        $childId = $child->id;
        $today = now()->toDateString();

        $items = $events->map(function ($event) use ($childId, $today) {
            $totalLessons = $event->lessons->count();
            $attendedLessons = EventAttendance::whereIn('event_lesson_id', $event->lessons->pluck('id'))
                ->where('child_id', $childId)
                ->where('attended', true)
                ->count();

            $attendanceMap = EventAttendance::whereIn('event_lesson_id', $event->lessons->pluck('id'))
                ->where('child_id', $childId)
                ->get()
                ->keyBy('event_lesson_id');

            $nextLesson = $event->lessons
                ->filter(fn($l) => $l->lesson_date->toDateString() >= $today)
                ->sortBy('lesson_date')
                ->first();

            $lastPastLesson = $event->lessons
                ->filter(fn($l) => $l->lesson_date->toDateString() < $today)
                ->sortByDesc('lesson_date')
                ->first();

            $lastAttendance = null;
            if ($lastPastLesson) {
                $att = $attendanceMap->get($lastPastLesson->id);
                $lastAttendance = $att ? (bool) $att->attended : null;
            }

            $missedLessons = $event->lessons
                ->filter(function ($l) use ($today, $attendanceMap) {
                    if ($l->lesson_date->toDateString() >= $today) return false;
                    $att = $attendanceMap->get($l->id);
                    return $att && $att->attended === false;
                })
                ->map(fn($l) => [
                    'lesson_number' => $l->lesson_number,
                    'date' => $l->lesson_date->format('d.m.Y'),
                ])
                ->values();

            return [
                'id' => $event->id,
                'title' => $event->title,
                'type' => $event->type,
                'description' => $event->description,
                'start_date' => $event->start_date?->format('d.m.Y'),
                'lessons_count' => $totalLessons,
                'attended_count' => $attendedLessons,
                'schedule_type' => $event->schedule_type,
                'schedule_interval' => $event->schedule_interval,
                'schedule_day_of_week' => $event->schedule_day_of_week,
                'next_lesson' => $nextLesson ? [
                    'date' => $nextLesson->lesson_date->format('d.m.Y'),
                    'lesson_number' => $nextLesson->lesson_number,
                ] : null,
                'last_lesson' => $lastPastLesson ? [
                    'date' => $lastPastLesson->lesson_date->format('d.m.Y'),
                    'lesson_number' => $lastPastLesson->lesson_number,
                    'attended' => $lastAttendance,
                ] : null,
                'missed_lessons' => $missedLessons,
            ];
        });

        return response()->json(['data' => $items]);
    }

    private function checkAchievements(Child $child): array
    {
        $newlyEarned = [];

        // 1. Настроение: длительность
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

        // 2. Настроение: неделя одинакового
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

        // 3. Суперсилы на 10
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

        // 4. Количество пройденных тестов
        $completedTests = TestAttempt::where('user_id', $child->user_id)
            ->where('is_completed', true)
            ->get();

        $testsCount = $completedTests->count();

        $testMilestones = [
            'beginner'    => 1,
            'researcher'  => 3,
            'expert'      => 5,
            'professor'   => 8,
            'magistr'     => 10,
            'doctor'      => 15,
            'academician' => 20,
            'legend'      => 30,
        ];

        foreach ($testMilestones as $code => $threshold) {
            if ($testsCount >= $threshold) {
                $id = $this->award($child, $code);
                if ($id !== null) $newlyEarned[] = $id;
            }
        }

        // 5. Скрытые за тесты
        if ($testsCount > 0) {
            $id = $this->award($child, 'first_test');
            if ($id !== null) $newlyEarned[] = $id;
        }


                // 6. Раскраски
        $coloringsCount = \App\Models\ChildColoring::where('child_id', $child->id)->count();

        $coloringMilestones = [
            'coloring_1'  => 1,
            'coloring_3'  => 3,
            'coloring_6'  => 6,
            'coloring_9'  => 9,
            'coloring_10' => 10,
        ];

        foreach ($coloringMilestones as $code => $threshold) {
            if ($coloringsCount >= $threshold) {
                $id = $this->award($child, $code);
                if ($id !== null) $newlyEarned[] = $id;
            }
        }

        $availableTestsCount = Test::where('is_active', true)
            ->whereIn('for_whom', ['child', 'both'])
            ->count();

        if ($availableTestsCount > 0 && $completedTests->pluck('test_id')->unique()->count() >= $availableTestsCount) {
            $id = $this->award($child, 'all_tests_done');
            if ($id !== null) $newlyEarned[] = $id;
        }

        foreach ($completedTests as $attempt) {
            $test = Test::find($attempt->test_id);
            if (!$test) continue;

            $totalQuestions = $test->questions()->count();
            $answersCount = TestAnswer::where('attempt_id', $attempt->id)->count();

            if ($totalQuestions > 0 && $answersCount >= $totalQuestions) {
                $id = $this->award($child, 'perfect_score_test');
                if ($id !== null) $newlyEarned[] = $id;

                $hasSkipped = TestAnswer::where('attempt_id', $attempt->id)
                    ->whereNull('value_json')
                    ->exists();

                if (!$hasSkipped) {
                    $id = $this->award($child, 'no_skips_test');
                    if ($id !== null) $newlyEarned[] = $id;
                }
            }

            $hasLuscher = $test->questions()->where('type', 'luscher')->exists();
            if ($hasLuscher) {
                $id = $this->award($child, 'luscher_test');
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

           public function useColoring(Request $request, $key)
    {
        $child = $this->getChild($request);
        if (!$child) {
            return response()->json(['message' => 'Профиль ребёнка не найден'], 403);
        }

        \App\Models\ChildColoring::firstOrCreate([
            'child_id' => $child->id,
            'coloring_key' => (string) $key,
        ]);

        $newlyEarnedIds = $this->checkColoringAchievements($child);

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
            'message' => 'Раскраска учтена',
            'newly_earned' => $newlyEarned,
            'stars' => (int) $child->fresh()->stars,
        ]);
    }


        private function checkColoringAchievements(Child $child): array
    {
        $newlyEarned = [];

        $coloringsCount = \App\Models\ChildColoring::where('child_id', $child->id)->count();

        $coloringMilestones = [
            'coloring_1'  => 1,
            'coloring_3'  => 3,
            'coloring_6'  => 6,
            'coloring_9'  => 9,
            'coloring_10' => 10,
        ];

        foreach ($coloringMilestones as $code => $threshold) {
            if ($coloringsCount >= $threshold) {
                $id = $this->award($child, $code);
                if ($id !== null) $newlyEarned[] = $id;
            }
        }

        return $newlyEarned;
    }
}