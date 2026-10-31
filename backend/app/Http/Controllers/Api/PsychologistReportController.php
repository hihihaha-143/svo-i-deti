<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TestAttempt;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PsychologistReportController extends Controller
{
    public function children(Request $request): JsonResponse
    {
        [$from, $to] = $this->resolvePeriod($request);

        $children = User::query()
            ->where('role', 'child')
            ->get(['id', 'name', 'login']);

        $childIds = $children->pluck('id')->all();

        $moodStats = DB::table('mood_entries')
            ->select('child_id', 'mood', DB::raw('COUNT(*) as cnt'))
            ->whereIn('child_id', $childIds)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->groupBy('child_id', 'mood')
            ->get()
            ->groupBy('child_id');

        $testStats = TestAttempt::query()
            ->select('user_id', DB::raw('COUNT(*) as cnt'))
            ->whereIn('user_id', $childIds)
            ->where('is_completed', true)
            ->whereBetween('finished_at', [$from, $to])
            ->groupBy('user_id')
            ->pluck('cnt', 'user_id');

        $riskIds = $this->childrenInRisk($childIds, $from, $to);

        $rows = $children->map(function (User $child) use ($moodStats, $testStats, $riskIds) {
            $moods = $moodStats->get($child->id, collect());

            $goodRow = $moods->firstWhere('mood', 'good');
            $normalRow = $moods->firstWhere('mood', 'normal');
            $badRow = $moods->firstWhere('mood', 'bad');

            $good = $goodRow ? (int) $goodRow->cnt : 0;
            $normal = $normalRow ? (int) $normalRow->cnt : 0;
            $bad = $badRow ? (int) $badRow->cnt : 0;
            $totalMoods = $good + $normal + $bad;
            $tests = (int) ($testStats[$child->id] ?? 0);

            return [
                'id' => $child->id,
                'name' => $child->name,
                'login' => $child->login,
                'moods_total' => $totalMoods,
                'moods_good' => $good,
                'moods_normal' => $normal,
                'moods_bad' => $bad,
                'tests_completed' => $tests,
                'is_active' => $totalMoods > 0 || $tests > 0,
                'is_risk' => in_array($child->id, $riskIds, true),
            ];
        })->values();

        return response()->json([
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'summary' => [
                'total_children' => $children->count(),
                'active_children' => $rows->where('is_active', true)->count(),
                'children_with_tests' => $rows->where('tests_completed', '>', 0)->count(),
                'children_in_risk' => $rows->where('is_risk', true)->count(),
            ],
            'children' => $rows,
        ]);
    }

    public function child(Request $request, int $childId): JsonResponse
    {
        [$from, $to] = $this->resolvePeriod($request);

        $child = User::query()
            ->where('role', 'child')
            ->findOrFail($childId);

        $moods = DB::table('mood_entries')
            ->where('child_id', $childId)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->orderBy('date')
            ->orderBy('id')
            ->get(['id', 'mood', 'date', 'created_at']);

        $attempts = TestAttempt::query()
            ->with('test:id,title')
            ->where('user_id', $childId)
            ->whereBetween('finished_at', [$from, $to])
            ->orderByDesc('finished_at')
            ->get()
            ->map(function (TestAttempt $attempt) {
                return [
                    'id' => $attempt->id,
                    'test' => $attempt->test?->title,
                    'is_completed' => $attempt->is_completed,
                    'finished_at' => $attempt->finished_at?->toIso8601String(),
                ];
            });

        $good = $moods->where('mood', 'good')->count();
        $normal = $moods->where('mood', 'normal')->count();
        $bad = $moods->where('mood', 'bad')->count();

        return response()->json([
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'child' => [
                'id' => $child->id,
                'name' => $child->name,
                'login' => $child->login,
            ],
            'summary' => [
                'moods_total' => $moods->count(),
                'moods_good' => $good,
                'moods_normal' => $normal,
                'moods_bad' => $bad,
                'tests_completed' => $attempts->where('is_completed', true)->count(),
                'is_risk' => in_array($childId, $this->childrenInRisk([$childId], $from, $to), true),
            ],
            'moods' => $moods->map(fn ($m) => [
                'id' => $m->id,
                'value' => $m->mood,
                'created_at' => Carbon::parse($m->date . ' ' . ($m->created_at ? Carbon::parse($m->created_at)->format('H:i:s') : '00:00:00'))->toIso8601String(),
            ]),
            'attempts' => $attempts,
        ]);
    }

    public function childrenExport(Request $request)
    {
        $response = $this->children($request)->getData(true);

        $generatedAt = now()->format('d.m.Y H:i');

        $pdf = Pdf::loadView('pdf.report-children', [
            'period' => $response['period'],
            'summary' => $response['summary'],
            'rows' => $response['children'],
            'generatedAt' => $generatedAt,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('report-children-' . $response['period']['from'] . '_' . $response['period']['to'] . '.pdf');
    }

    public function childExport(Request $request, int $childId)
    {
        $response = $this->child($request, $childId)->getData(true);

        $generatedAt = now()->format('d.m.Y H:i');

        $pdf = Pdf::loadView('pdf.report-child', [
            'period' => $response['period'],
            'child' => $response['child'],
            'summary' => $response['summary'],
            'moods' => $response['moods'],
            'attempts' => $response['attempts'],
            'generatedAt' => $generatedAt,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('report-child-' . $childId . '-' . $response['period']['from'] . '_' . $response['period']['to'] . '.pdf');
    }

    private function resolvePeriod(Request $request): array
    {
        $from = $request->filled('date_from')
            ? Carbon::parse($request->input('date_from'))->startOfDay()
            : now()->startOfMonth();

        $to = $request->filled('date_to')
            ? Carbon::parse($request->input('date_to'))->endOfDay()
            : now()->endOfDay();

        return [$from, $to];
    }

    private function childrenInRisk(array $childIds, Carbon $from, Carbon $to): array
    {
        if (empty($childIds)) {
            return [];
        }

        $rows = DB::table('mood_entries')
            ->whereIn('child_id', $childIds)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->orderBy('child_id')
            ->orderBy('date')
            ->get(['child_id', 'mood', 'date']);

        $byChild = $rows->groupBy('child_id');
        $risk = [];

        foreach ($byChild as $childId => $items) {
            $days = [];
            foreach ($items as $item) {
                $day = $item->date;
                if (!isset($days[$day])) {
                    $days[$day] = $item->mood;
                }
            }

            ksort($days);

            $streak = 0;
            foreach ($days as $value) {
                if ($value === 'bad') {
                    $streak++;
                    if ($streak >= 3) {
                        $risk[] = (int) $childId;
                        break;
                    }
                } else {
                    $streak = 0;
                }
            }
        }

        return $risk;
    }
}