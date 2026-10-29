<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\Mentor;
use App\Models\ParentModel;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class PsychologistDashboardController extends Controller
{
    public function index(Request $request)
    {
        $psychologist = $request->user()->psychologist;

        if (!$psychologist) {
            return response()->json(['message' => 'Профиль психолога не найден'], 403);
        }

        // Основная статистика
        $childrenCount = Child::where('psychologist_id', $psychologist->id)->count();
        $parentsCount = ParentModel::where('psychologist_id', $psychologist->id)->count();
        $mentorsCount = Mentor::where('psychologist_id', $psychologist->id)->count();
        
        // Заглушки для будущих таблиц
        $anketasCount = 0; 
        $messagesCount = 0;

        // Статистика онлайна (по токенам)
        $fiveMinutesAgo = now()->subMinutes(5);
        
        $onlineTotal = PersonalAccessToken::where('last_used_at', '>=', $fiveMinutesAgo)->count();
        
        $onlineChildren = PersonalAccessToken::where('last_used_at', '>=', $fiveMinutesAgo)
            ->whereHas('tokenable', function ($query) {
                $query->where('role', 'child');
            })->count();

        $onlineParents = PersonalAccessToken::where('last_used_at', '>=', $fiveMinutesAgo)
            ->whereHas('tokenable', function ($query) {
                $query->where('role', 'parent');
            })->count();

        $onlineMentors = PersonalAccessToken::where('last_used_at', '>=', $fiveMinutesAgo)
            ->whereHas('tokenable', function ($query) {
                $query->where('role', 'mentor');
            })->count();

        return response()->json([
            'data' => [
                'children' => $childrenCount,
                'parents' => $parentsCount,
                'mentors' => $mentorsCount,
                'anketas' => $anketasCount,
                'messages' => $messagesCount,
                'online_total' => $onlineTotal,
                'online_children' => $onlineChildren,
                'online_parents' => $onlineParents,
                'online_mentors' => $onlineMentors,
            ]
        ]);
    }
}