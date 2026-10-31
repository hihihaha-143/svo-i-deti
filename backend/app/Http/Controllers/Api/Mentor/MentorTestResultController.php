<?php

namespace App\Http\Controllers\Api\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\TestAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MentorTestResultController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $mentor = $request->user()->mentor;

        if (!$mentor) {
            return response()->json([
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 15,
                'total' => 0,
            ]);
        }

        $childUserIds = Child::query()
            ->where('mentor_id', $mentor->id)
            ->pluck('user_id');

        $query = TestAttempt::query()
            ->with(['test:id,title', 'user:id,name,login'])
            ->where('is_completed', true)
            ->whereIn('user_id', $childUserIds)
            ->orderByDesc('finished_at');

        if ($request->filled('child_id')) {
            $query->where('user_id', $request->integer('child_id'));
        }
        if ($request->filled('test_id')) {
            $query->where('test_id', $request->integer('test_id'));
        }

        $attempts = $query->paginate($request->integer('per_page', 15));

        $attempts->getCollection()->transform(function (TestAttempt $attempt) {
            return [
                'id' => $attempt->id,
                'child' => [
                    'id' => $attempt->user->id,
                    'name' => $attempt->user->name,
                    'login' => $attempt->user->login,
                ],
                'test' => [
                    'id' => $attempt->test->id,
                    'title' => $attempt->test->title,
                ],
                'completed_at' => $attempt->finished_at?->toIso8601String(),
            ];
        });

        return response()->json($attempts);
    }
}