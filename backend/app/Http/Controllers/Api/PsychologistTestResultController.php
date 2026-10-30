<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChildSuperpower;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PsychologistTestResultController extends Controller
{
    /**
     * Список завершённых результатов тестов (попыток) с фильтрами и пагинацией.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TestAttempt::query()
            ->with(['test:id,title', 'user:id,name,login'])
            ->where('is_completed', true)
            ->orderByDesc('finished_at');

        if ($request->filled('child_id')) {
            $query->where('user_id', $request->integer('child_id'));
        }

        if ($request->filled('test_id')) {
            $query->where('test_id', $request->integer('test_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('finished_at', '>=', $request->date('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('finished_at', '<=', $request->date('date_to'));
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
                'answers_count' => $attempt->answers()->count(),
                'completed_at' => $attempt->finished_at?->toIso8601String(),
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
                'user:id,name,login',
                'answers.question:id,text,type,options',
            ])
            ->findOrFail($attemptId);

        $answers = $attempt->answers->map(function (TestAnswer $answer) {
            return [
                'id' => $answer->id,
                'question' => [
                    'id' => $answer->question->id,
                    'text' => $answer->question->text,
                    'type' => $answer->question->type,
                    'options' => $answer->question->options,
                ],
                'answer' => $answer->value_json,
                'answered_at' => $answer->created_at?->toIso8601String(),
            ];
        });

        $superpowers = ChildSuperpower::query()
            ->where('child_id', $attempt->user_id)
            ->first();

        return response()->json([
            'attempt' => [
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
            ],
            'answers' => $answers,
            'superpowers' => $superpowers ? $this->superpowersPayload($superpowers) : null,
            'qualities' => ChildSuperpower::QUALITIES,
        ]);
    }

    /**
     * Сравнение текущей попытки с предыдущей попыткой того же теста у того же ребёнка.
     */
    public function compare(int $attemptId): JsonResponse
    {
        $attempt = TestAttempt::query()
            ->with([
                'test:id,title',
                'user:id,name,login',
                'answers.question:id,text,type,options',
            ])
            ->findOrFail($attemptId);

        $previous = TestAttempt::query()
            ->with([
                'answers.question:id,text,type,options',
            ])
            ->where('user_id', $attempt->user_id)
            ->where('test_id', $attempt->test_id)
            ->where('is_completed', true)
            ->where('id', '!=', $attempt->id)
            ->where(function ($q) use ($attempt) {
                $q->where('finished_at', '<', $attempt->finished_at)
                    ->orWhere(function ($q2) use ($attempt) {
                        $q2->where('finished_at', $attempt->finished_at)
                            ->where('id', '<', $attempt->id);
                    });
            })
            ->orderByDesc('finished_at')
            ->orderByDesc('id')
            ->first();

        if (!$previous) {
            return response()->json([
                'has_previous' => false,
                'attempt' => [
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
                ],
            ]);
        }

        $previousAnswers = $previous->answers->keyBy('question_id');

        $rows = $attempt->answers->map(function (TestAnswer $answer) use ($previousAnswers) {
            $prev = $previousAnswers->get($answer->question_id);

            return [
                'question' => [
                    'id' => $answer->question->id,
                    'text' => $answer->question->text,
                    'type' => $answer->question->type,
                    'options' => $answer->question->options,
                ],
                'current' => $answer->value_json,
                'previous' => $prev?->value_json,
            ];
        });

        return response()->json([
            'has_previous' => true,
            'attempt' => [
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
            ],
            'previous_attempt' => [
                'id' => $previous->id,
                'completed_at' => $previous->finished_at?->toIso8601String(),
            ],
            'rows' => $rows,
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
                ['child_id' => $attempt->user_id],
                $validated
            );
        });

        return response()->json([
            'superpowers' => $this->superpowersPayload($superpowers),
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

    private function superpowersPayload(ChildSuperpower $superpowers): array
    {
        $payload = [];
        foreach (array_keys(ChildSuperpower::QUALITIES) as $key) {
            $payload[$key] = $superpowers->{$key};
        }
        return $payload;
    }
}