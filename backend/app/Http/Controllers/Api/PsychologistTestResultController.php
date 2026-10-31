<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChildSuperpower;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class PsychologistTestResultController extends Controller
{
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

    public function show(int $attemptId): JsonResponse
    {
        $attempt = TestAttempt::query()
            ->with([
                'test:id,title',
                'user:id,name,login',
                'answers.question:id,question_text,type,options,scale_min_label,scale_max_label',
            ])
            ->findOrFail($attemptId);

        $answers = $attempt->answers->map(function (TestAnswer $answer) {
            return [
                'id' => $answer->id,
                'question' => [
                    'id' => $answer->question->id,
                    'text' => $answer->question->question_text,
                    'type' => $answer->question->type,
                    'options' => $answer->question->options,
                    'scale_min_label' => $answer->question->scale_min_label,
                    'scale_max_label' => $answer->question->scale_max_label,
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

    public function compare(int $attemptId): JsonResponse
    {
        $attempt = TestAttempt::query()
            ->with([
                'test:id,title',
                'user:id,name,login',
                'answers.question:id,question_text,type,options,scale_min_label,scale_max_label',
            ])
            ->findOrFail($attemptId);

        $previous = TestAttempt::query()
            ->with([
                'answers.question:id,question_text,type,options,scale_min_label,scale_max_label',
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
                    'text' => $answer->question->question_text,
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

    public function exportPdf(int $attemptId)
    {
        $attempt = TestAttempt::query()
            ->with([
                'test:id,title',
                'user:id,name,login',
                'answers.question:id,question_text,type,options,scale_min_label,scale_max_label',
            ])
            ->findOrFail($attemptId);

        $superpowers = ChildSuperpower::query()
            ->where('child_id', $attempt->user_id)
            ->first();

        $answers = $attempt->answers->map(function (TestAnswer $answer) {
            return [
                'question' => $answer->question->question_text,
                'type' => $answer->question->type,
                'answer' => $this->formatAnswerValue($answer->value_json, $answer->question),
            ];
        })->values()->all();

        $superpowersRows = [];
        if ($superpowers) {
            foreach (ChildSuperpower::QUALITIES as $key => $label) {
                $superpowersRows[] = [
                    'label' => $label,
                    'value' => (int) $superpowers->{$key},
                ];
            }
        }

        $generatedAt = now()->format('d.m.Y H:i');

        $pdf = Pdf::loadView('pdf.test-result', [
            'attempt' => $attempt,
            'answers' => $answers,
            'superpowersRows' => $superpowersRows,
            'generatedAt' => $generatedAt,
        ])->setPaper('a4', 'portrait');

        $safeChild = preg_replace('/[^\p{L}\p{N}_-]+/u', '_', $attempt->user->name ?: $attempt->user->login);
        $fileName = 'test-result-' . $attempt->id . '-' . trim($safeChild, '_') . '.pdf';

        return $pdf->download($fileName);
    }

    private function formatAnswerValue($value, $question): string
    {
        if ($value === null || $value === '') {
            return 'skipped';
        }

        if ($question->type === 'single') {
            if (is_array($value)) {
                if (isset($value['text']) && $value['text'] !== '') {
                    return (string) $value['text'];
                }

                $options = is_array($question->options) ? $question->options : [];
                $idx = $value['index'] ?? null;
                $optionId = $value['option_id'] ?? null;

                if ($idx !== null && isset($options[$idx]['text'])) {
                    return (string) $options[$idx]['text'];
                }

                if ($optionId !== null && isset($options[$optionId - 1]['text'])) {
                    return (string) $options[$optionId - 1]['text'];
                }

                return 'Вариант #' . ($optionId ?? '?');
            }
            return (string) $value;
        }

        if ($question->type === 'scale' && is_array($value) && array_key_exists('value', $value)) {
            return (string) $value['value'];
        }

        if ($question->type === 'luscher' && is_array($value) && array_key_exists('order', $value)) {
            return is_array($value['order']) ? implode(' → ', $value['order']) : (string) $value['order'];
        }

        if (is_string($value)) {
            return $value;
        }

        if (is_array($value) && array_key_exists('value', $value)) {
            return (string) $value['value'];
        }

        return json_encode($value, JSON_UNESCAPED_UNICODE);
    }
}