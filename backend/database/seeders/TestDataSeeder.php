<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Psychologist;
use App\Models\Mentor;
use App\Models\ParentModel;
use App\Models\Child;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $psy = Psychologist::first();
        if (!$psy) {
            $this->command->info('Сначала создай психолога!');
            return;
        }

        // Наставник
        $mentorUser = User::firstOrCreate(
            ['login' => 'mentor_test'],
            ['name' => 'Тест Наставник', 'password' => 'secret123', 'role' => 'mentor']
        );
        $mentor = Mentor::firstOrCreate(
            ['user_id' => $mentorUser->id],
            ['psychologist_id' => $psy->id, 'organization' => 'Школа №1']
        );

        // Родитель
        $parentUser = User::firstOrCreate(
            ['login' => 'parent_test'],
            ['name' => 'Тест Родитель', 'password' => 'secret123', 'role' => 'parent']
        );
        $parent = ParentModel::firstOrCreate(
            ['user_id' => $parentUser->id],
            ['psychologist_id' => $psy->id, 'mentor_id' => $mentor->id]
        );

        // Дети
        $child1User = User::firstOrCreate(
            ['login' => 'child1_test'],
            ['name' => 'Ребенок 1', 'password' => 'secret123', 'role' => 'child']
        );
        Child::firstOrCreate(
            ['user_id' => $child1User->id],
            ['psychologist_id' => $psy->id, 'mentor_id' => $mentor->id, 'parent_id' => $parent->id]
        );

        $child2User = User::firstOrCreate(
            ['login' => 'child2_test'],
            ['name' => 'Ребенок 2', 'password' => 'secret123', 'role' => 'child']
        );
        Child::firstOrCreate(
            ['user_id' => $child2User->id],
            ['psychologist_id' => $psy->id, 'mentor_id' => $mentor->id, 'parent_id' => $parent->id]
        );

        $this->command->info('Тестовые данные добавлены!');
    }
}