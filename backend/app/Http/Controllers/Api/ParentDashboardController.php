<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\DailyTip;
use App\Models\DiaryEntry;
use App\Models\ParentModel;
use App\Models\ParentRecommendation;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ParentDashboardController extends Controller
{
    private const EVENT_LABELS = [
        'before_school' => 'Перед школой',
        'after_school'  => 'После школы',
        'homework'      => 'Домашнее задание',
        'walk'          => 'Прогулка',
        'other'         => 'Другое',
    ];

    private function getParent(Request $request): ?ParentModel
    {
        return ParentModel::where('user_id', $request->user()->id)->first();
    }

    public function children(Request $request)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $children = Child::with('user')
            ->where('parent_id', $parent->id)
            ->get()
            ->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->user->name,
                    'login' => $child->user->login,
                ];
            });

        return response()->json(['data' => $children]);
    }

    public function recommendations(Request $request)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $recommendations = ParentRecommendation::where('parent_id', $parent->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($rec) {
                return [
                    'id' => $rec->id,
                    'text' => $rec->text,
                    'created_at' => $rec->created_at,
                ];
            });

        return response()->json(['data' => $recommendations]);
    }

    public function tests(Request $request)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $tests = Test::where('is_active', true)
            ->whereIn('for_whom', ['parent', 'both'])
            ->get()
            ->map(function ($test) use ($parent) {
                $attempt = TestAttempt::where('test_id', $test->id)
                    ->where('user_id', $parent->user_id)
                    ->where('is_completed', true)
                    ->exists();

                return [
                    'id' => $test->id,
                    'title' => $test->title,
                    'is_passed' => $attempt,
                ];
            });

        return response()->json(['data' => $tests]);
    }

    public function dailyTip(Request $request)
    {
        $tip = DailyTip::orderByDesc('created_at')->first();

        return response()->json([
            'data' => $tip ? ['text' => $tip->text] : null,
        ]);
    }

    public function diaries(Request $request)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $query = DiaryEntry::with('child.user')
            ->where('parent_id', $parent->id);

        $childId = $request->query('child_id', 'all');
        if ($childId !== 'all' && is_numeric($childId)) {
            $query->where('child_id', $childId);
        }

        $event = $request->query('event', 'all');
        if (array_key_exists($event, self::EVENT_LABELS)) {
            $query->where('event', $event);
        }

        $paginator = $query->orderByDesc('created_at')->orderByDesc('id')->paginate(20);

        $items = $paginator->getCollection()->map(function ($entry) {
            return [
                'id' => $entry->id,
                'child_id' => $entry->child_id,
                'child_name' => $entry->child->user->name ?? '—',
                'event' => $entry->event,
                'event_label' => self::EVENT_LABELS[$entry->event] ?? '—',
                'text' => $entry->text,
                'date' => $entry->created_at->format('d.m.Y H:i'),
            ];
        })->values();

        $children = Child::with('user')
            ->where('parent_id', $parent->id)
            ->get()
            ->map(fn($c) => ['id' => $c->id, 'name' => $c->user->name ?? '—'])
            ->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'children' => $children,
            'events' => array_map(
                fn($key, $label) => ['value' => $key, 'label' => $label],
                array_keys(self::EVENT_LABELS),
                self::EVENT_LABELS
            ),
        ]);
    }

    public function storeDiary(Request $request)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $validated = $request->validate([
            'child_id' => [
                'required',
                Rule::exists('children', 'id')->where('parent_id', $parent->id),
            ],
            'event' => ['required', Rule::in(array_keys(self::EVENT_LABELS))],
            'text' => ['required', 'string', 'max:5000'],
        ]);

        $entry = DiaryEntry::create([
            'child_id' => $validated['child_id'],
            'parent_id' => $parent->id,
            'event' => $validated['event'],
            'text' => $validated['text'],
        ]);

        return response()->json([
            'message' => 'Запись добавлена',
            'data' => [
                'id' => $entry->id,
            ],
        ], 201);
    }

    public function destroyDiary(Request $request, $id)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $entry = DiaryEntry::where('parent_id', $parent->id)->findOrFail($id);
        $entry->delete();

        return response()->json(['message' => 'Запись удалена']);
    }



        public function materials(Request $request)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $materials = \App\Models\ParentMaterial::where('is_published', true)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'title' => $m->title,
                    'excerpt' => $m->preview ?? \Illuminate\Support\Str::limit(strip_tags($m->content), 200),
                    'created_at' => $m->created_at->format('d.m.Y'),
                ];
            });

        return response()->json(['data' => $materials]);
    }

    public function material(Request $request, $id)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $material = \App\Models\ParentMaterial::where('is_published', true)->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $material->id,
                'title' => $material->title,
                'content' => $material->content,
                'created_at' => $material->created_at->format('d.m.Y'),
            ],
        ]);
    }
}