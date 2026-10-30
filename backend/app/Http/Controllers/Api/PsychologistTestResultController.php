<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChildSuperpower;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PsychologistTestResultController extends Controller
{
    /**
     * Список результатов тестов (попыток) с фильтрами и пагинацией.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TestAttempt::query()
            ->with(['test:id,title', 'child:id,first_name,last_name,login'])
            ->orderByDesc('completed_at');

        if ($request->filled('child_id')) {
            $query->where('child_id', $request->integer('child_id'));
        }

        if ($request->filled('test_id')) {
            $query->where('test_id', $request->integer('test_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('completed_at', '>=', $request->date('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('completed_at', '<=', $request->date('date_to'));
        }

        $attempts = $query->paginate($request->integer('per_page', 15));

        $attempts->getCollection()->transform(function (TestAttempt $attempt) {
            return [
                'id' => $attempt->id,
                'child' => [
                    'id' => $attempt->child->id,
                    'name' => trim($attempt->child->first_name . ' ' . $attempt->child->last_name),
                    'login' => $attempt->child->login,
                ],
                'test' => [
                    'id' => $attempt->test->id,
                    'title' => $attempt->test->title,
                ],
                'answers_count' => $attempt->answers()->count(),
                'completed_at' => $attempt->completed_at?->toIso8601String(),
            ];
        });

        return response()->json($attempts);
    }

    /**
     * Детальный просмотр ответов по попытке.
     */
    public function show(int $attemptId): JsonResponse
    {
        $attempt = TestAttempt::query()
            ->with([
                'test:id,title',
                'child:id,first_name,last_name,login',
                'answers.question:id,text,type',
            ])
            ->findOrFail($attemptId);

        $answers = $attempt->answers->map(function ($answer) {
            return [
                'id' => $answer->id,
                'question' => [
                    'id' => $answer->question->id,
                    'text' => $answer->question->text,
                    'type' => $answer->question->type,
                ],
                'answer' => $answer->answer,
                'answered_at' => $answer->created_at?->toIso8601String(),
            ];
        });

        $superpowers = ChildSuperpower::query()
            ->where('child_id', $attempt->child_id)
            ->first();

        return response()->json([
            'attempt' => [
                'id' => $attempt->id,
                'child' => [
                    'id' => $attempt->child->id,
                    'name' => trim($attempt->child->first_name . ' ' . $attempt->child->last_name),
                    'login' => $attempt->child->login,
                ],
                'test' => [
                    'id' => $attempt->test->id,
                    'title' => $attempt->test->title,
                ],
                'completed_at' => $attempt->completed_at?->toIso8601String(),
            ],
            'answers' => $answers,
            'superpowers' => $superpowers ? [
                'independence' => $superpowers->independence,
                'emotional_sphere' => $superpowers->emotional_sphere,
                'responsibility' => $superpowers->responsibility,
                'creativity' => $superpowers->creativity,
                'organization' => $superpowers->organization,
                'sociability' => $superpowers->sociability,
                'social_activity' => $superpowers->social_activity,
                'willpower' => $superpowers->willpower,
            ] : null,
            'qualities' => ChildSuperpower::QUALITIES,
        ]);
    }

    /**
     * Обновление «суперсил» ребёнка (0–10 по каждому качеству).
     */
    public function updateSuperpowers(Request $request, int $attemptId): JsonResponse
    {
        $attempt = TestAttempt::findOrFail($attemptId);

        $rules = [];
        foreach (array_keys(ChildSuperpower::QUALITIES) as $key) {
            $rules[$key] = ['required', 'integer', 'min:0', 'max:10'];
        }

        $validated = $request->validate($rules);

        $superpowers = DB::transaction(function () use ($attempt, $validated) {
            return ChildSuperpower::updateOrCreate(
                ['child_id' => $attempt->child_id],
                $validated
            );
        });

        return response()->json([
            'superpowers' => [
                'independence' => $superpowers->independence,
                'emotional_sphere' => $superpowers->emotional_sphere,
                'responsibility' => $superpowers->responsibility,
                'creativity' => $superpowers->creativity,
                'organization' => $superpowers->organization,
                'sociability' => $superpowers->sociability,
                'social_activity' => $superpowers->social_activity,
                'willpower' => $superpowers->willpower,
            ],
        ]);
    }

    /**
     * Удаление попытки.
     */
    public function destroy(int $attemptId): JsonResponse
    {
        $attempt = TestAttempt::findOrFail($attemptId);
        $attempt->delete();

        return response()->json(['message' => 'Попытка удалена']);
    }
}