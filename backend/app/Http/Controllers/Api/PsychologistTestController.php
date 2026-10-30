<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PsychologistTestController extends Controller
{
    public function index(Request $request)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) {
            return response()->json(['message' => 'Профиль психолога не найден'], 403);
        }

        $query = Test::where('psychologist_id', $psychologist->id)
            ->withCount('questions');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where('title', 'like', "%{$search}%");
        }

        $forWhom = $request->query('for_whom', 'all');
        if (in_array($forWhom, ['child', 'parent', 'both'], true)) {
            $query->where('for_whom', $forWhom);
        }

        $isActive = $request->query('is_active', 'all');
        if ($isActive === '1' || $isActive === '0') {
            $query->where('is_active', $isActive === '1');
        }

        $isMonthly = $request->query('is_monthly', 'all');
        if ($isMonthly === '1' || $isMonthly === '0') {
            $query->where('is_monthly', $isMonthly === '1');
        }

        $perPage = 20;
        $paginator = $query->orderByDesc('id')->paginate($perPage);

        $forWhomLabels = ['child' => 'Для детей', 'parent' => 'Для родителей', 'both' => 'Для всех'];

        $items = $paginator->getCollection()->map(function ($test) use ($forWhomLabels) {
            return [
                'id' => $test->id,
                'title' => $test->title,
                'for_whom' => $test->for_whom,
                'for_whom_label' => $forWhomLabels[$test->for_whom] ?? '—',
                'description' => $test->description,
                'age_restrictions' => $test->age_restrictions,
                'motivation_text' => $test->motivation_text,
                'coloring_file' => $test->coloring_file,
                'coloring_file_url' => $test->coloring_file ? Storage::url($test->coloring_file) : null,
                'is_active' => $test->is_active,
                'is_monthly' => $test->is_monthly,
                'questions_count' => $test->questions_count,
                'created_at' => $test->created_at?->format('d.m.Y H:i'),
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

    public function show(Request $request, int $id)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) {
            return response()->json(['message' => 'Профиль психолога не найден'], 403);
        }

        $test = Test::where('psychologist_id', $psychologist->id)
            ->with('questions')
            ->find($id);

        if (!$test) {
            return response()->json(['message' => 'Тест не найден'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $test->id,
                'title' => $test->title,
                'for_whom' => $test->for_whom,
                'description' => $test->description,
                'age_restrictions' => $test->age_restrictions,
                'motivation_text' => $test->motivation_text,
                'coloring_file' => $test->coloring_file,
                'coloring_file_url' => $test->coloring_file ? Storage::url($test->coloring_file) : null,
                'is_active' => $test->is_active,
                'is_monthly' => $test->is_monthly,
                'questions' => $test->questions->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'question_text' => $q->question_text,
                        'type' => $q->type,
                        'order' => $q->order,
                        'options' => $q->options,
                        'scale_min_label' => $q->scale_min_label,
                        'scale_max_label' => $q->scale_max_label,
                        'allow_skip' => $q->allow_skip,
                        'age_restrictions' => $q->age_restrictions,
                    ];
                })->values(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) {
            return response()->json(['message' => 'Профиль психолога не найден'], 403);
        }

        $validated = $this->validateTest($request);

        DB::beginTransaction();
        try {
            $test = Test::create([
                'psychologist_id' => $psychologist->id,
                'title' => $validated['title'],
                'for_whom' => $validated['for_whom'],
                'description' => $validated['description'] ?? null,
                'age_restrictions' => $validated['age_restrictions'] ?? null,
                'motivation_text' => $validated['motivation_text'] ?? null,
                'coloring_file' => $validated['coloring_file'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'is_monthly' => $validated['is_monthly'] ?? false,
                'created_by' => $request->user()->id,
            ]);

            $this->syncQuestions($test, $validated['questions'] ?? []);

            DB::commit();

            return response()->json(['message' => 'Тест создан', 'id' => $test->id], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Ошибка при создании: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, int $id)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) {
            return response()->json(['message' => 'Профиль психолога не найден'], 403);
        }

        $test = Test::where('psychologist_id', $psychologist->id)->find($id);
        if (!$test) {
            return response()->json(['message' => 'Тест не найден'], 404);
        }

        $validated = $this->validateTest($request);

        DB::beginTransaction();
        try {
            $test->update([
                'title' => $validated['title'],
                'for_whom' => $validated['for_whom'],
                'description' => $validated['description'] ?? null,
                'age_restrictions' => $validated['age_restrictions'] ?? null,
                'motivation_text' => $validated['motivation_text'] ?? null,
                'coloring_file' => $validated['coloring_file'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'is_monthly' => $validated['is_monthly'] ?? false,
            ]);

            $this->syncQuestions($test, $validated['questions'] ?? []);

            DB::commit();

            return response()->json(['message' => 'Тест обновлён']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Ошибка при обновлении: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, int $id)
    {
        $psychologist = $request->user()->psychologist;
        if (!$psychologist) {
            return response()->json(['message' => 'Профиль психолога не найден'], 403);
        }

        $test = Test::where('psychologist_id', $psychologist->id)->find($id);
        if (!$test) {
            return response()->json(['message' => 'Тест не найден'], 404);
        }

        $test->delete();

        return response()->json(['message' => 'Тест удалён']);
    }

    public function uploadColoring(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:png,jpg,jpeg,pdf', 'max:5120'],
        ]);

        $path = $request->file('file')->store('tests/coloring', 'public');

        return response()->json([
            'data' => [
                'path' => $path,
                'url' => Storage::url($path),
            ],
            'message' => 'Файл загружен',
        ]);
    }

    private function validateTest(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'for_whom' => ['required', 'in:child,parent,both'],
            'description' => ['nullable', 'string'],
            'age_restrictions' => ['nullable', 'array'],
            'age_restrictions.min' => ['nullable', 'integer', 'min:0', 'max:100'],
            'age_restrictions.max' => ['nullable', 'integer', 'min:0', 'max:100'],
            'motivation_text' => ['nullable', 'string'],
            'coloring_file' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'is_monthly' => ['nullable', 'boolean'],

            'questions' => ['nullable', 'array'],
            'questions.*.id' => ['nullable', 'integer'],
            'questions.*.question_text' => ['required', 'string'],
            'questions.*.type' => ['required', 'in:single,scale,luscher'],
            'questions.*.order' => ['nullable', 'integer', 'min:0'],
            'questions.*.options' => ['nullable', 'array'],
            'questions.*.scale_min_label' => ['nullable', 'string', 'max:255'],
            'questions.*.scale_max_label' => ['nullable', 'string', 'max:255'],
            'questions.*.allow_skip' => ['nullable', 'boolean'],
            'questions.*.age_restrictions' => ['nullable', 'array'],
            'questions.*.age_restrictions.min' => ['nullable', 'integer', 'min:0', 'max:100'],
            'questions.*.age_restrictions.max' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);
    }

    private function syncQuestions(Test $test, array $questions): void
    {
        $existingIds = $test->questions()->pluck('id')->toArray();
        $keptIds = [];

        foreach ($questions as $index => $qData) {
            $data = [
                'question_text' => $qData['question_text'],
                'type' => $qData['type'],
                'order' => $qData['order'] ?? $index,
                'options' => $qData['options'] ?? null,
                'scale_min_label' => $qData['scale_min_label'] ?? null,
                'scale_max_label' => $qData['scale_max_label'] ?? null,
                'allow_skip' => $qData['allow_skip'] ?? true,
                'age_restrictions' => $qData['age_restrictions'] ?? null,
            ];

            if (!empty($qData['id']) && in_array($qData['id'], $existingIds, true)) {
                $question = Question::find($qData['id']);
                $question->update($data);
                $keptIds[] = $question->id;
            } else {
                $question = $test->questions()->create($data);
                $keptIds[] = $question->id;
            }
        }

        $toDelete = array_diff($existingIds, $keptIds);
        if (!empty($toDelete)) {
            Question::whereIn('id', $toDelete)->delete();
        }
    }
}