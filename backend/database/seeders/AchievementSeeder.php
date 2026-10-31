<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            // Из макета (23)
            ['code' => 'taste_refined',      'title' => 'Утончённый вкус',           'icon' => 'palette',      'stars_reward' => 0,   'is_hidden' => false],
            ['code' => 'first_message',      'title' => 'Первое сообщение',           'icon' => 'message',      'stars_reward' => 0,   'is_hidden' => false],
            ['code' => 'honest_child',       'title' => 'Самый честный ребёнок',      'icon' => 'shield',       'stars_reward' => 0,   'is_hidden' => false],
            ['code' => 'color_magic',        'title' => 'Магия цвета',                'icon' => 'rainbow',      'stars_reward' => 0,   'is_hidden' => false],
            ['code' => 'mood_week',          'title' => 'Неделя настроения',          'icon' => 'flame',        'stars_reward' => 7,   'is_hidden' => false],
            ['code' => 'mood_month',         'title' => 'Месяц настроения',           'icon' => 'star',         'stars_reward' => 30,  'is_hidden' => false],
            ['code' => 'mood_master',        'title' => 'Мастер настроения',          'icon' => 'crown',        'stars_reward' => 100, 'is_hidden' => false],
            ['code' => 'beginner',           'title' => 'Начинающий',                 'icon' => 'pencil',       'stars_reward' => 10,  'is_hidden' => false],
            ['code' => 'researcher',         'title' => 'Исследователь',              'icon' => 'search',       'stars_reward' => 20,  'is_hidden' => false],
            ['code' => 'expert',             'title' => 'Эксперт',                    'icon' => 'book',         'stars_reward' => 30,  'is_hidden' => false],
            ['code' => 'professor',          'title' => 'Профессор',                  'icon' => 'graduation',   'stars_reward' => 50,  'is_hidden' => false],
            ['code' => 'magistr',            'title' => 'Магистр',                    'icon' => 'brain',        'stars_reward' => 60,  'is_hidden' => false],
            ['code' => 'doctor',             'title' => 'Доктор наук',                'icon' => 'zap',          'stars_reward' => 70,  'is_hidden' => false],
            ['code' => 'academician',        'title' => 'Академик',                   'icon' => 'bank',         'stars_reward' => 80,  'is_hidden' => false],
            ['code' => 'legend',             'title' => 'Легенда',                    'icon' => 'diamond',      'stars_reward' => 100, 'is_hidden' => false],
            ['code' => 'artist',             'title' => 'Художник',                   'icon' => 'brush',        'stars_reward' => 3,   'is_hidden' => false],
            ['code' => 'young_artist',       'title' => 'Юный художник',              'icon' => 'palette',      'stars_reward' => 5,   'is_hidden' => false],
            ['code' => 'brush_master',       'title' => 'Мастер кисти',               'icon' => 'image',        'stars_reward' => 10,  'is_hidden' => false],
            ['code' => 'picasso',            'title' => 'Пикассо',                    'icon' => 'trophy',       'stars_reward' => 15,  'is_hidden' => false],
            ['code' => 'social_activity',    'title' => 'Социальная активность',      'icon' => 'trophy',       'stars_reward' => 0,   'is_hidden' => false],
            ['code' => 'willpower',          'title' => 'Сила воли',                  'icon' => 'trophy',       'stars_reward' => 0,   'is_hidden' => false],
            ['code' => 'quiet_test',         'title' => 'Тихий тест',                 'icon' => 'hat',          'stars_reward' => 0,   'is_hidden' => false],

            // Новые — за длительность настроения
            ['code' => 'mood_90_days',       'title' => '3 месяца настроения',        'icon' => 'calendar',     'stars_reward' => 90,  'is_hidden' => false],
            ['code' => 'mood_year',          'title' => 'Год настроения',             'icon' => 'calendar',     'stars_reward' => 350, 'is_hidden' => false],

            // Первая смена темы
            ['code' => 'first_theme_change', 'title' => 'Первая смена темы',          'icon' => 'palette',      'stars_reward' => 5,   'is_hidden' => false],

            // Скрытые — за неделю конкретного настроения
            ['code' => 'week_good_mood',     'title' => 'Неделя хорошего настроения', 'icon' => 'smile',        'stars_reward' => 0,   'is_hidden' => true],
            ['code' => 'week_normal_mood',   'title' => 'Неделя нормального настроения','icon' => 'meh',        'stars_reward' => 0,   'is_hidden' => true],
            ['code' => 'week_bad_mood',      'title' => 'Неделя плохого настроения',  'icon' => 'frown',        'stars_reward' => 0,   'is_hidden' => true],
        ];

        foreach ($achievements as $item) {
            Achievement::updateOrCreate(
                ['code' => $item['code']],
                $item
            );
        }
    }
}