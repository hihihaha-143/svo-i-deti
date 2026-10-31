<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Test;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class TestResultsDemoSeeder extends Seeder
{
    public function run(): void
    {
        $psychologist = User::firstOrCreate(
            ['login' => 'psychologist_demo'],
            [
                'name' => 'Психолог Демо',
                'password' => 'password',
                'role' => 'psychologist',
            ]
        );

        $child = User::firstOrCreate(
            ['login' => 'child_demo'],
            [
                'name' => 'Ребёнок Демо',
                'password' => 'password',
                'role' => 'child',
            ]
        );

        $child2 = User::firstOrCreate(
            ['login' => 'child_demo_2'],
            [
                'name' => 'Второй Ребёнок',
                'password' => 'password',
                'role' => 'child',
            ]
        );

        $singleTest = Test::create([
            'title' => 'Демо: Самостоятельность',
            'for_whom' => 'child',
            'description' => 'Демонстрационный тест для проверки результатов.',
            'age_restrictions' => null,
            'motivation_text' => 'Спасибо за прохождение!',
            'coloring_file' => null,
            'is_active' => true,
            'is_monthly' => false,
            'created_by' => $psychologist->id,
        ]);

        $scaleTest = Test::create([
            'title' => 'Демо: Организованность',
            'for_whom' => 'both',
            'description' => 'Шкальный демонстрационный тест.',
            'age_restrictions' => null,
            'motivation_text' => 'Спасибо за прохождение!',
            'coloring_file' => null,
            'is_active' => true,
            'is_monthly' => false,
            'created_by' => $psychologist->id,
        ]);

        $luscherTest = Test::create([
            'title' => 'Демо: Тест Люшера',
            'for_whom' => 'child',
            'description' => 'Демонстрация цветового теста.',
            'age_restrictions' => null,
            'motivation_text' => 'Спасибо за прохождение!',
            'coloring_file' => null,
            'is_active' => true,
            'is_monthly' => false,
            'created_by' => $psychologist->id,
        ]);

        $singleQuestions = [
            ['question_text' => 'Вы предпочитаете самостоятельно решать свои проблемы?', 'options' => ['Да', 'Нет', 'Иногда']],
            ['question_text' => 'Вы сами покупаете себе продукты питания и готовите?', 'options' => ['Да', 'Нет', 'Иногда']],
            ['question_text' => 'Вы финансово независимы?', 'options' => ['Да', 'Нет', 'Иногда']],
        ];

        $singleModels = [];
        foreach ($singleQuestions as $i => $q) {
            $singleModels[] = Question::create([
                'test_id' => $singleTest->id,
                'question_text' => $q['question_text'],
                'type' => 'single',
                'order' => $i + 1,
                'options' => $q['options'],
                'scale_min_label' => null,
                'scale_max_label' => null,
                'allow_skip' => true,
                'age_restrictions' => null,
            ]);
        }

        $scaleQuestions = [
            'Вы боритесь с прокрастинацией?',
            'Вы заранее готовитесь к следующему дню?',
            'Делите крупные задачи на мелкие?',
        ];

        $scaleModels = [];
        foreach ($scaleQuestions as $i => $text) {
            $scaleModels[] = Question::create([
                'test_id' => $scaleTest->id,
                'question_text' => $text,
                'type' => 'scale',
                'order' => $i + 1,
                'options' => null,
                'scale_min_label' => 'Полностью НЕ согласен',
                'scale_max_label' => 'Полностью согласен',
                'allow_skip' => true,
                'age_restrictions' => null,
            ]);
        }

        $luscherQuestion = Question::create([
            'test_id' => $luscherTest->id,
            'question_text' => 'Выбери цвета в порядке, который тебе больше нравится',
            'type' => 'luscher',
            'order' => 1,
            'options' => null,
            'scale_min_label' => null,
            'scale_max_label' => null,
            'allow_skip' => true,
            'age_restrictions' => null,
        ]);

        $this->createAttempt($child, $singleTest, $singleModels, [
            ['value' => 'Да'],
            ['value' => 'Иногда'],
            ['value' => 'Нет'],
        ], Carbon::now()->subDays(14));

        $this->createAttempt($child, $singleTest, $singleModels, [
            ['value' => 'Да'],
            ['value' => 'Да'],
            ['value' => 'Иногда'],
        ], Carbon::now()->subDays(1));

        $this->createAttempt($child, $scaleTest, $scaleModels, [
            ['value' => 7],
            ['value' => 8],
            ['value' => 6],
        ], Carbon::now()->subDays(3));

        $this->createAttempt($child, $luscherTest, [$luscherQuestion], [
            ['order' => [1, 4, 2, 5, 3, 6, 7, 8]],
        ], Carbon::now()->subDays(2));

        $this->createAttempt($child2, $singleTest, $singleModels, [
            ['value' => 'Иногда'],
            ['value' => 'Нет'],
            ['value' => 'Да'],
        ], Carbon::now()->subDays(1));

        $this->createAttempt($child2, $scaleTest, $scaleModels, [
            ['value' => 4],
            ['value' => 5],
            ['value' => 3],
        ], Carbon::now()->subHours(6));
    }

    private function createAttempt(User $child, Test $test, array $questions, array $answers, Carbon $finishedAt): void
    {
        $attempt = TestAttempt::create([
            'test_id' => $test->id,
            'user_id' => $child->id,
            'started_at' => $finishedAt->copy()->subMinutes(15),
            'finished_at' => $finishedAt,
            'score' => null,
            'result_json' => null,
            'is_completed' => true,
        ]);

        foreach ($questions as $index => $question) {
            if (!isset($answers[$index])) {
                continue;
            }

            TestAnswer::create([
                'attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'value_json' => $answers[$index],
            ]);
        }
    }
}