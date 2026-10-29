<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use Illuminate\Http\Request;

class PsychologistLoginLogController extends Controller
{
    public function index(Request $request)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) {
            return response()->json(['message' => 'Профиль не найден'], 403);
        }

        $mentorUserIds = \App\Models\Mentor::where('psychologist_id', $psychologist->id)->pluck('user_id');
        $parentUserIds = \App\Models\ParentModel::where('psychologist_id', $psychologist->id)->pluck('user_id');
        $childUserIds = \App\Models\Child::where('psychologist_id', $psychologist->id)->pluck('user_id');

        $allowedUserIds = $mentorUserIds
            ->merge($parentUserIds)
            ->merge($childUserIds)
            ->unique()
            ->values();

        $query = LoginLog::with('user')
            ->whereIn('user_id', $allowedUserIds);

        $role = $request->query('role', 'all');
        if (in_array($role, ['mentor', 'parent', 'child'], true)) {
            $idsByRole = match ($role) {
                'mentor' => $mentorUserIds,
                'parent' => $parentUserIds,
                'child'  => $childUserIds,
            };
            $query->whereIn('user_id', $idsByRole);
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('login', 'like', "%{$search}%");
            });
        }

        $dateFrom = $request->query('date_from');
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        $dateTo = $request->query('date_to');
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $perPage = 20;
        $paginator = $query->orderByDesc('created_at')->orderByDesc('id')->paginate($perPage);

        $roleLabels = [
            'mentor'  => 'Наставник',
            'parent'  => 'Родитель',
            'child'   => 'Ребёнок',
            'psychologist' => 'Психолог',
        ];

        $items = $paginator->getCollection()->map(function ($log) use ($roleLabels) {
            return [
                'id'       => $log->id,
                'datetime' => $log->created_at->format('d.m.Y H:i'),
                'name'     => $log->user->name ?? '—',
                'login'    => $log->user->login ?? '—',
                'role'     => $log->user->role ?? null,
                'role_label' => $roleLabels[$log->user->role] ?? '—',
            ];
        })->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }
}