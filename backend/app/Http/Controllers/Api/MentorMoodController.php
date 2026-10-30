<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\MoodEntry;
use Illuminate\Http\Request;

class MentorMoodController extends Controller
{
    public function index(Request $request)
    {
        $mentor = $request->user()->mentor;
        if (!$mentor) {
            return response()->json(['message' => 'Профиль наставника не найден'], 403);
        }

        $children = Child::with('user')
            ->where('mentor_id', $mentor->id)
            ->get();

        $childrenIds = $children->pluck('id');

        // Базовый запрос
        $query = MoodEntry::whereIn('child_id', $childrenIds);

        // Фильтры
        $childId = $request->query('child_id', 'all');
        if ($childId !== 'all' && is_numeric($childId)) {
            $query->where('child_id', $childId);
        }

        $mood = $request->query('mood', 'all');
        if (in_array($mood, ['good', 'normal', 'bad'], true)) {
            $query->where('mood', $mood);
        }

        $dateFrom = $request->query('date_from');
        if ($dateFrom) {
            $query->whereDate('date', '>=', $dateFrom);
        }

        $dateTo = $request->query('date_to');
        if ($dateTo) {
            $query->whereDate('date', '<=', $dateTo);
        }

        // --- Сводка за период (по умолчанию 30 дней) ---
        $summaryQuery = clone $query;
        if (!$dateFrom && !$dateTo) {
            $summaryQuery->where('date', '>=', now()->subDays(30)->toDateString());
        }

        $summaryRaw = $summaryQuery->selectRaw('mood, COUNT(*) as cnt')
            ->groupBy('mood')
            ->pluck('cnt', 'mood');

        $summary = [
            'good'   => (int) ($summaryRaw['good'] ?? 0),
            'normal' => (int) ($summaryRaw['normal'] ?? 0),
            'bad'    => (int) ($summaryRaw['bad'] ?? 0),
        ];

        // --- Данные для графика (последние 30 дней) ---
        $chartQuery = MoodEntry::whereIn('child_id', $childrenIds)
            ->where('date', '>=', now()->subDays(30)->toDateString());

        if ($childId !== 'all' && is_numeric($childId)) {
            $chartQuery->where('child_id', $childId);
        }

        $moodValueMap = ['bad' => 1, 'normal' => 2, 'good' => 3];
        $moodLabelMap = ['bad' => 'Плохое', 'normal' => 'Нормальное', 'good' => 'Хорошее'];

        $chart = $chartQuery->with('child.user')
            ->orderBy('date')
            ->get()
            ->map(function ($entry) use ($moodValueMap, $moodLabelMap) {
                return [
                    'date' => $entry->date->format('d.m'),
                    'date_full' => $entry->date->format('Y-m-d'),
                    'mood' => $entry->mood,
                    'mood_label' => $moodLabelMap[$entry->mood] ?? '—',
                    'value' => $moodValueMap[$entry->mood] ?? 0,
                    'child_name' => $entry->child->user->name ?? '—',
                ];
            });

        // --- Таблица с пагинацией ---
        $perPage = 20;
        $paginator = $query->with('child.user')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate($perPage);

        // --- Зона риска по каждому ребёнку ---
        $riskMap = $this->calculateRiskMap($childrenIds);

        $moodLabels = ['good' => 'Хорошее', 'normal' => 'Нормальное', 'bad' => 'Плохое'];

        $items = $paginator->getCollection()->map(function ($entry) use ($riskMap, $moodLabels) {
            return [
                'id' => $entry->id,
                'child_id' => $entry->child_id,
                'child_name' => $entry->child->user->name ?? '—',
                'mood' => $entry->mood,
                'mood_label' => $moodLabels[$entry->mood] ?? '—',
                'date' => $entry->date->format('d.m.Y'),
                'risk' => $riskMap[$entry->child_id] ?? false,
            ];
        })->values();

        // --- Список детей для фильтра ---
        $childrenList = $children->map(fn($c) => [
            'id' => $c->id,
            'name' => $c->user->name ?? '—',
        ])->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
            'summary' => $summary,
            'chart' => $chart,
            'children' => $childrenList,
        ]);
    }

    /**
     * Считает флаг «Зона риска» для каждого ребёнка:
     * 3+ дня подряд с mood = 'bad'.
     */
    private function calculateRiskMap($childrenIds): array
    {
        $riskMap = [];

        $entries = MoodEntry::whereIn('child_id', $childrenIds)
            ->orderBy('child_id')
            ->orderBy('date')
            ->get(['child_id', 'date', 'mood']);

        $grouped = $entries->groupBy('child_id');

        foreach ($grouped as $childId => $childEntries) {
            $maxStreak = 0;
            $currentStreak = 0;
            $previousDate = null;

            foreach ($childEntries as $entry) {
                $isBad = $entry->mood === 'bad';
                $isConsecutive = $previousDate
                    && $entry->date->copy()->subDay()->toDateString() === $previousDate->toDateString();

                if ($isBad) {
                    $currentStreak = $isConsecutive ? $currentStreak + 1 : 1;
                    $maxStreak = max($maxStreak, $currentStreak);
                } else {
                    $currentStreak = 0;
                }

                $previousDate = $entry->date;
            }

            $riskMap[$childId] = $maxStreak >= 3;
        }

        return $riskMap;
    }
}