<?php

namespace Database\Seeders;

use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestAttemptsSeeder extends Seeder
{
    public function run(): void
    {
        $test = Test::query()->where('title', 'Ежемесячный опрос')->first();
        if (!$test) {
            $this->command?->warn('Тест «Ежемесячный опрос» не найден. Сначала запусти TestsSeeder.');
            return;
        }

        $child = User::query()->where('role', 'child')->first();
        if (!$child) {
            $this->command?->warn('Нет пользователя с role=child. Создай ребёнка или укажи user_id вручную.');
            return;
        }

        $questions = $test->questions()->orderBy('order')->get();
        if ($questions->isEmpty()) {
            $this->command?->warn('У теста нет вопросов. Сначала запусти QuestionsSeeder.');
            return;
        }

        // Удаляем прошлые попытки этого ребёнка по этому тесту, чтобы сидер был идемпотентным.
        TestAttempt::query()
            ->where('user_id', $child->id)
            ->where('test_id', $test->id)
            ->get()
            ->each(fn (TestAttempt $a) => $a->delete());

        // Попытка №1 (более старая).
        $this->createAttempt($test, $child, $questions, [
            'answers' => [
                'Как твоя учёба в школе?' => ['option_index' => 1],        // «Нормально, иногда трудно»
                'Как твои отношения с родителями?' => ['option_index' => 0], // «Тёплые и доверительные»
                'Как ты чувствуешь себя среди друзей?' => ['option_index' => 1], // «Нормально, есть пара близких»
                'Как ты обычно спишь?' => ['option_index' => 1],             // «Нормально, иногда не высыпаюсь»
                'Как твоё настроение в последнее время?' => ['value' => 3], // шкала
                'Чувствуешь ли ты поддержку от семьи?' => ['option_index' => 0], // «Да, всегда»
                'Что тебя беспокоит больше всего?' => ['option_index' => 0], // «Учёба»
                'Как ты оцениваешь свою уверенность в себе?' => ['value' => 3], // шкала
            ],
            'started_at' => now()->subDays(14)->subMinutes(20),
            'finished_at' => now()->subDays(14),
            'score' => 60,
        ]);

        // Попытка №2 (более свежая).
        $this->createAttempt($test, $child, $questions, [
            'answers' => [
                'Как твоя учёба в школе?' => ['option_index' => 0],        // «Отлично, всё получается»
                'Как твои отношения с родителями?' => ['option_index' => 0], // «Тёплые и доверительные»
                'Как ты чувствуешь себя среди друзей?' => ['option_index' => 0], // «Отлично, много друзей»
                'Как ты обычно спишь?' => ['option_index' => 0],             // «Хорошо, высыпаюсь»
                'Как твоё настроение в последнее время?' => ['value' => 5], // шкала
                'Чувствуешь ли ты поддержку от семьи?' => ['option_index' => 0], // «Да, всегда»
                'Что тебя беспокоит больше всего?' => ['option_index' => 5], // «Ничего не беспокоит» (если есть; иначе см. ниже)
                'Как ты оцениваешь свою уверенность в себе?' => ['value' => 4], // шкала
            ],
            'started_at' => now()->subDays(2)->subMinutes(15),
            'finished_at' => now()->subDays(2),
            'score' => 85,
        ]);
    }

    private function createAttempt(Test $test, User $child, $questions, array $payload): void
    {
        $attempt = TestAttempt::create([
            'test_id' => $test->id,
            'user_id' => $child->id,
            'started_at' => $payload['started_at'],
            'finished_at' => $payload['finished_at'],
            'score' => $payload['score'],
            'result_json' => null,
            'is_completed' => true,
        ]);

        foreach ($questions as $question) {
            $spec = $payload['answers'][$question->question_text] ?? null;
            if ($spec === null) {
                continue;
            }

            $valueJson = $this->buildValueJson($question, $spec);
            if ($valueJson === null) {
                continue;
            }

            $attempt->answers()->create([
                'question_id' => $question->id,
                'value_json' => $valueJson,
            ]);
        }
    }

      private function buildValueJson($question, array $spec): ?array
    {
        if ($question->type === 'scale') {
            return ['value' => (int) ($spec['value'] ?? 0)];
        }

        if ($question->type === 'single') {
            $options = is_array($question->options) ? $question->options : [];
            $index = $spec['option_index'] ?? 0;

            if (!isset($options[$index])) {
                return null;
            }

            return [
                'option_id' => $index + 1,
                'index' => $index,
                'text' => $options[$index]['text'] ?? '',
            ];
        }

        if ($question->type === 'luscher') {
            return ['order' => $spec['order'] ?? []];
        }

        return null;
    }
}