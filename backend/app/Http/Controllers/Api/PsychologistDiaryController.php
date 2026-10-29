<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\DiaryEntry;
use App\Models\ParentModel;
use Illuminate\Http\Request;

class PsychologistDiaryController extends Controller
{
    private const EVENT_LABELS = [
        'before_school' => 'Перед школой',
        'after_school'  => 'После школы',
        'homework'      => 'Домашнее задание',
        'walk'          => 'Прогулка',
        'other'         => 'Другое',
    ];

    public function index(Request $request)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) {
            return response()->json(['message' => 'Профиль не найден'], 403);
        }

        $children = Child::with('user')
            ->where('psychologist_id', $psychologist->id)
            ->get();
        $childrenIds = $children->pluck('id');

        $parents = ParentModel::with('user')
            ->where('psychologist_id', $psychologist->id)
            ->get();
        $parentsIds = $parents->pluck('id');

        $query = DiaryEntry::with(['child.user', 'parent.user'])
            ->whereIn('child_id', $childrenIds)
            ->whereIn('parent_id', $parentsIds);

        // Фильтры
        $childId = $request->query('child_id', 'all');
        if ($childId !== 'all' && is_numeric($childId)) {
            $query->where('child_id', $childId);
        }

        $parentId = $request->query('parent_id', 'all');
        if ($parentId !== 'all' && is_numeric($parentId)) {
            $query->where('parent_id', $parentId);
        }

        $event = $request->query('event', 'all');
        if (array_key_exists($event, self::EVENT_LABELS)) {
            $query->where('event', $event);
        }

        $dateFrom = $request->query('date_from');
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        $dateTo = $request->query('date_to');
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Пагинация
        $perPage = 20;
        $paginator = $query->orderByDesc('created_at')->orderByDesc('id')->paginate($perPage);

        $items = $paginator->getCollection()->map(function ($entry) {
            return [
                'id' => $entry->id,
                'child_id' => $entry->child_id,
                'child_name' => $entry->child->user->name ?? '—',
                'parent_id' => $entry->parent_id,
                'parent_name' => $entry->parent->user->name ?? '—',
                'event' => $entry->event,
                'event_label' => self::EVENT_LABELS[$entry->event] ?? '—',
                'text' => $entry->text,
                'date' => $entry->created_at->format('d.m.Y H:i'),
            ];
        })->values();

        // Сводка по событиям (для PDF и возможного отображения)
        $summaryQuery = DiaryEntry::whereIn('child_id', $childrenIds)
            ->whereIn('parent_id', $parentsIds);

        if ($childId !== 'all' && is_numeric($childId)) {
            $summaryQuery->where('child_id', $childId);
        }
        if ($parentId !== 'all' && is_numeric($parentId)) {
            $summaryQuery->where('parent_id', $parentId);
        }
        if (array_key_exists($event, self::EVENT_LABELS)) {
            $summaryQuery->where('event', $event);
        }
        if ($dateFrom) {
            $summaryQuery->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $summaryQuery->whereDate('created_at', '<=', $dateTo);
        }

        $summaryRaw = $summaryQuery->selectRaw('event, COUNT(*) as cnt')
            ->groupBy('event')
            ->pluck('cnt', 'event');

        $summary = [];
        foreach (self::EVENT_LABELS as $key => $label) {
            $summary[] = [
                'event' => $key,
                'label' => $label,
                'count' => (int) ($summaryRaw[$key] ?? 0),
            ];
        }

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
            'children' => $children->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->user->name ?? '—',
            ])->values(),
            'parents' => $parents->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->user->name ?? '—',
            ])->values(),
            'events' => array_map(
                fn($key, $label) => ['value' => $key, 'label' => $label],
                array_keys(self::EVENT_LABELS),
                self::EVENT_LABELS
            ),
            'summary' => $summary,
        ]);
    }

    public function export(Request $request)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) {
            return response()->json(['message' => 'Профиль не найден'], 403);
        }

        $childrenIds = Child::where('psychologist_id', $psychologist->id)->pluck('id');
        $parentsIds = ParentModel::where('psychologist_id', $psychologist->id)->pluck('id');

        $query = DiaryEntry::with(['child.user', 'parent.user'])
            ->whereIn('child_id', $childrenIds)
            ->whereIn('parent_id', $parentsIds);

        $childId = $request->query('child_id', 'all');
        if ($childId !== 'all' && is_numeric($childId)) {
            $query->where('child_id', $childId);
        }

        $parentId = $request->query('parent_id', 'all');
        if ($parentId !== 'all' && is_numeric($parentId)) {
            $query->where('parent_id', $parentId);
        }

        $event = $request->query('event', 'all');
        if (array_key_exists($event, self::EVENT_LABELS)) {
            $query->where('event', $event);
        }

        $dateFrom = $request->query('date_from');
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        $dateTo = $request->query('date_to');
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $entries = $query->orderByDesc('created_at')->orderByDesc('id')->get();

        if ($entries->isEmpty()) {
            return response()->json(['message' => 'Нет данных для выгрузки'], 404);
        }

        $rows = $entries->map(function ($entry) {
            return [
                'child_name' => $entry->child->user->name ?? '—',
                'parent_name' => $entry->parent->user->name ?? '—',
                'event_label' => self::EVENT_LABELS[$entry->event] ?? '—',
                'text' => $entry->text,
                'date' => $entry->created_at->format('d.m.Y H:i'),
            ];
        });

        // Сводка по событиям
        $summaryRaw = $query->selectRaw('event, COUNT(*) as cnt')
            ->groupBy('event')
            ->pluck('cnt', 'event');

        $summary = [];
        foreach (self::EVENT_LABELS as $key => $label) {
            $summary[] = [
                'label' => $label,
                'count' => (int) ($summaryRaw[$key] ?? 0),
            ];
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.diaries-export', [
            'rows' => $rows,
            'summary' => $summary,
            'generatedAt' => now()->format('d.m.Y H:i'),
        ])->setPaper('a4', 'portrait');

        $fileName = 'diaries-' . now()->format('Y-m-d_His') . '.pdf';

        return $pdf->download($fileName);
    }
}