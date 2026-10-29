<?php

namespace Database\Seeders;

use App\Models\ChatTemplateCategory;
use Illuminate\Database\Seeder;

class ChatTemplateCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Общие',
            'Поддержка',
            'Похвала',
            'Приветствия',
            'Прощание',
        ];

        foreach ($categories as $name) {
            ChatTemplateCategory::firstOrCreate(['name' => $name]);
        }
    }
}