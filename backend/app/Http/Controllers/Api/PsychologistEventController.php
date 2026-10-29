<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventLesson;
use App\Models\Mentor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PsychologistEventController extends Controller
{
    public function index(Request $request)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) {
            return response()->json(['message' => 'Профиль не найден'], 403);
        }

        $childrenIds = Child::where('psychologist_id', $psychologist->id)->pluck('id');

        $query = Event::with(['children.user', 'mentor.user'])
            ->where('psychologist_id', $psychologist->id);

        // Поиск по названию
        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where('title', 'like', "%{$search}%");
        }

        // Тип
        $type = $request->query('type', 'all');
        if (in_array($type, ['psychologist', 'mentor'], true)) {
            $query->where('type', $type);
        }

        // Количество занятий (точное совпадение)
        $lessonsCount = $request->query('lessons_count');
        if ($lessonsCount !== null && $lessonsCount !== '' && is_numeric($lessonsCount)) {
            $query->where('lessons_count', (int) $lessonsCount);
        }

        // Дата от / до
        $dateFrom = $request->query('date_from');
        if ($dateFrom) {
            $query->whereDate('start_date', '>=', $dateFrom);
        }
        $dateTo = $request->query('date_to');
        if ($dateTo) {
            $query->whereDate('start_date', '<=', $dateTo);
        }

        $perPage = 20;
        $paginator = $query->orderByDesc('start_date')->orderByDesc('id')->paginate($perPage);

        $typeLabels = ['psychologist' => 'Психолог', 'mentor' => 'Наставник'];

        $items = $paginator->getCollection()->map(function ($event) use ($typeLabels) {
            $childNames = $event->children->map(fn($c) => $c->user->name ?? '—')->values()->all();
            return [
                'id' => $event->id,
                'title' => $event->title,
                'type' => $event->type,
                'type_label' => $typeLabels[$event->type] ?? '—',
                'start_date' => $event->start_date->format('d.m.Y'),
                'lessons_count' => $event->lessons_count,
                'children_count' => count($childNames),
                'children_names' => $childNames,
                'description' => $event->description,
                'schedule_type' => $event->schedule_type,
                'schedule_interval' => $event->schedule_interval,
                'schedule_day_of_week' => $event->schedule_day_of_week,
            ];
        })->values();

        // Список детей психолога — для модалки создания/редактирования
        $children = Child::with('user')
            ->where('psychologist_id', $psychologist->id)
            ->get()
            ->map(fn($c) => ['id' => $c->id, 'name' => $c->user->name ?? '—'])
            ->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
            'children' => $children,
        ]);
    }

    public function store(Request $request)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) {
            return response()->json(['message' => 'Профиль не найден'], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:psychologist,mentor'],
            'lessons_count' => ['required', 'integer', 'min:1', 'max:365'],
            'start_date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
            'schedule_type' => ['required', 'in:weekly,every_n_days,daily,monthly'],
            'schedule_interval' => ['nullable', 'integer', 'min:1', 'max:365'],
            'schedule_day_of_week' => ['nullable', 'integer', 'min:0', 'max:6'],
            'child_ids' => ['required', 'array', 'min:1'],
            'child_ids.*' => ['integer', 'exists:children,id'],
        ]);

        if ($validated['schedule_type'] === 'every_n_days' && empty($validated['schedule_interval'])) {
            return response()->json(['message' => 'Укажите интервал в днях'], 422);
        }
        if ($validated['schedule_type'] === 'weekly' && !isset($validated['schedule_day_of_week'])) {
            return response()->json(['message' => 'Укажите день недели'], 422);
        }

        // Только дети этого психолога
        $allowedChildrenIds = Child::where('psychologist_id', $psychologist->id)
            ->whereIn('id', $validated['child_ids'])
            ->pluck('id')
            ->toArray();

        if (count($allowedChildrenIds) !== count($validated['child_ids'])) {
            return response()->json(['message' => 'Некоторые дети не принадлежат этому психологу'], 403);
        }

        $mentorId = null;
        if ($validated['type'] === 'mentor') {
            $mentorId = $request->user()->mentor?->id;
            if (!$mentorId) {
                return response()->json(['message' => 'Профиль наставника не найден'], 403);
            }
        }

        DB::beginTransaction();
        try {
            $event = Event::create([
                'psychologist_id' => $psychologist->id,
                'mentor_id' => $mentorId,
                'title' => $validated['title'],
                'type' => $validated['type'],
                'lessons_count' => $validated['lessons_count'],
                'start_date' => $validated['start_date'],
                'description' => $validated['description'] ?? null,
                'schedule_type' => $validated['schedule_type'],
                'schedule_interval' => $validated['schedule_type'] === 'every_n_days' ? $validated['schedule_interval'] : null,
                'schedule_day_of_week' => $validated['schedule_type'] === 'weekly' ? $validated['schedule_day_of_week'] : null,
            ]);

            $event->children()->attach($allowedChildrenIds);

            $dates = $this->generateLessonDates(
                $validated['start_date'],
                $validated['lessons_count'],
                $validated['schedule_type'],
                $validated['schedule_interval'] ?? null,
                $validated['schedule_day_of_week'] ?? null
            );

            foreach ($dates as $i => $date) {
                EventLesson::create([
                    'event_id' => $event->id,
                    'lesson_number' => $i + 1,
                    'lesson_date' => $date,
                ]);
            }

            DB::commit();

            return response()->json(['message' => 'Мероприятие создано', 'id' => $event->id], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Ошибка при создании: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $psychologist = $request->user()->psychologist;
        $event = Event::where('psychologist_id', $psychologist->id)->findOrFail($id);

        if ($event->type === 'mentor') {
            return response()->json(['message' => 'Нельзя редактировать мероприятие наставника'], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'lessons_count' => ['required', 'integer', 'min:1', 'max:365'],
            'start_date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
            'schedule_type' => ['required', 'in:weekly,every_n_days,daily,monthly'],
            'schedule_interval' => ['nullable', 'integer', 'min:1', 'max:365'],
            'schedule_day_of_week' => ['nullable', 'integer', 'min:0', 'max:6'],
            'child_ids' => ['required', 'array', 'min:1'],
            'child_ids.*' => ['integer', 'exists:children,id'],
        ]);

        $allowedChildrenIds = Child::where('psychologist_id', $psychologist->id)
            ->whereIn('id', $validated['child_ids'])
            ->pluck('id')
            ->toArray();

        if (count($allowedChildrenIds) !== count($validated['child_ids'])) {
            return response()->json(['message' => 'Некоторые дети не принадлежат этому психологу'], 403);
        }

        DB::beginTransaction();
        try {
            $scheduleChanged =
                $event->schedule_type !== $validated['schedule_type'] ||
                $event->schedule_interval !== ($validated['schedule_interval'] ?? null) ||
                $event->schedule_day_of_week !== ($validated['schedule_day_of_week'] ?? null) ||
                $event->start_date->toDateString() !== $validated['start_date'];

            $event->update([
                'title' => $validated['title'],
                'lessons_count' => $validated['lessons_count'],
                'start_date' => $validated['start_date'],
                'description' => $validated['description'] ?? null,
                'schedule_type' => $validated['schedule_type'],
                'schedule_interval' => $validated['schedule_type'] === 'every_n_days' ? $validated['schedule_interval'] : null,
                'schedule_day_of_week' => $validated['schedule_type'] === 'weekly' ? $validated['schedule_day_of_week'] : null,
            ]);

            // Синхронизация детей (delete + insert)
            $event->children()->sync($allowedChildrenIds);

            $newCount = $validated['lessons_count'];
            $existingLessons = $event->lessons()->orderBy('lesson_number')->get();
            $currentCount = $existingLessons->count();

            if ($scheduleChanged || $newCount !== $currentCount) {
                if ($newCount < $currentCount) {
                    // Удалить лишние занятия
                    $idsToDelete = $existingLessons->slice($newCount)->pluck('id');
                    EventLesson::whereIn('id', $idsToDelete)->delete();
                } elseif ($newCount > $currentCount) {
                    // Добавить недостающие
                    $dates = $this->generateLessonDates(
                        $validated['start_date'],
                        $newCount,
                        $validated['schedule_type'],
                        $validated['schedule_interval'] ?? null,
                        $validated['schedule_day_of_week'] ?? null
                    );
                    for ($i = $currentCount; $i < $newCount; $i++) {
                        EventLesson::create([
                            'event_id' => $event->id,
                            'lesson_number' => $i + 1,
                            'lesson_date' => $dates[$i],
                        ]);
                    }
                }

                if ($scheduleChanged && $newCount === $currentCount) {
                    // Перегенерировать даты всех занятий
                    $dates = $this->generateLessonDates(
                        $validated['start_date'],
                        $newCount,
                        $validated['schedule_type'],
                        $validated['schedule_interval'] ?? null,
                        $validated['schedule_day_of_week'] ?? null
                    );
                    foreach ($existingLessons as $i => $lesson) {
                        $lesson->update(['lesson_date' => $dates[$i]]);
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Мероприятие обновлено']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Ошибка при обновлении: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        $psychologist = $request->user()->psychologist;
        $event = Event::where('psychologist_id', $psychologist->id)->findOrFail($id);

        if ($event->type === 'mentor') {
            return response()->json(['message' => 'Нельзя удалить мероприятие наставника'], 403);
        }

        $event->delete();
        return response()->json(['message' => 'Мероприятие удалено']);
    }

    public function attendance(Request $request, $id)
    {
        $psychologist = $request->user()->psychologist;
        $event = Event::where('psychologist_id', $psychologist->id)
            ->with(['children.user', 'lessons'])
            ->findOrFail($id);

        $lessons = $event->lessons->map(fn($l) => [
            'id' => $l->id,
            'lesson_number' => $l->lesson_number,
            'lesson_date' => $l->lesson_date->format('Y-m-d'),
        ])->values();

        $children = $event->children->map(fn($c) => [
            'id' => $c->id,
            'name' => $c->user->name ?? '—',
        ])->values();

        $attendanceRaw = EventAttendance::whereIn('event_lesson_id', $event->lessons->pluck('id'))
            ->get();

        $attendance = [];
        foreach ($attendanceRaw as $a) {
            $attendance[$a->event_lesson_id][$a->child_id] = (bool) $a->attended;
        }

        return response()->json([
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'type' => $event->type,
                'lessons_count' => $event->lessons_count,
                'start_date' => $event->start_date->format('d.m.Y'),
            ],
            'lessons' => $lessons,
            'children' => $children,
            'attendance' => $attendance,
        ]);
    }

    public function saveAttendance(Request $request, $id)
    {
        $psychologist = $request->user()->psychologist;
        $event = Event::where('psychologist_id', $psychologist->id)->findOrFail($id);

        if ($event->type === 'mentor') {
            return response()->json(['message' => 'Нельзя отмечать посещаемость мероприятия наставника'], 403);
        }

        $validated = $request->validate([
            'lessons' => ['required', 'array'],
            'lessons.*.id' => ['required', 'integer', 'exists:event_lessons,id'],
            'lessons.*.lesson_date' => ['required', 'date'],
            'attendance' => ['required', 'array'],
            'attendance.*.lesson_id' => ['required', 'integer', 'exists:event_lessons,id'],
            'attendance.*.child_id' => ['required', 'integer', 'exists:children,id'],
            'attendance.*.attended' => ['required', 'boolean'],
        ]);

        DB::beginTransaction();
        try {
            // Обновляем даты занятий
            foreach ($validated['lessons'] as $lessonData) {
                EventLesson::where('id', $lessonData['id'])
                    ->where('event_id', $event->id)
                    ->update(['lesson_date' => $lessonData['lesson_date']]);
            }

            // Обновляем посещаемость
            foreach ($validated['attendance'] as $att) {
                EventAttendance::updateOrCreate(
                    [
                        'event_lesson_id' => $att['lesson_id'],
                        'child_id' => $att['child_id'],
                    ],
                    ['attended' => $att['attended']]
                );
            }

            DB::commit();
            return response()->json(['message' => 'Посещаемость сохранена']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Ошибка: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Генерирует массив дат занятий по расписанию.
     */
    private function generateLessonDates(string $startDate, int $count, string $scheduleType, ?int $interval, ?int $dayOfWeek): array
    {
        $dates = [];
        $start = Carbon::parse($startDate);

        if ($scheduleType === 'weekly') {
            // Первое занятие — на ближайший указанный день недели (или сам start, если совпадает)
            $current = $start->copy();
            while ($current->dayOfWeekIso - 1 !== $dayOfWeek) {
                $current->addDay();
            }
            for ($i = 0; $i < $count; $i++) {
                $dates[] = $current->format('Y-m-d');
                $current->addWeek();
            }
        } elseif ($scheduleType === 'every_n_days') {
            $current = $start->copy();
            for ($i = 0; $i < $count; $i++) {
                $dates[] = $current->format('Y-m-d');
                $current->addDays($interval ?? 1);
            }
        } elseif ($scheduleType === 'daily') {
            $current = $start->copy();
            for ($i = 0; $i < $count; $i++) {
                $dates[] = $current->format('Y-m-d');
                $current->addDay();
            }
        } elseif ($scheduleType === 'monthly') {
            $current = $start->copy();
            for ($i = 0; $i < $count; $i++) {
                $dates[] = $current->format('Y-m-d');
                $current->addMonth();
            }
        }

        return $dates;
    }
}