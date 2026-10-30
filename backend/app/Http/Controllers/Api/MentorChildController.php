<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Child;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MentorChildController extends Controller
{
    public function index(Request $request)
    {
        $mentor = $request->user()->mentor;

        if (!$mentor) {
            return response()->json(['message' => 'Профиль наставника не найден'], 403);
        }

        $children = Child::with(['user', 'parent.user'])
            ->where('mentor_id', $mentor->id)
            ->get()
            ->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->user?->name,
                    'login' => $child->user?->login,
                    'parent_name' => $child->parent?->user?->name,
                ];
            })
            ->sortBy('name')
            ->values();

        return response()->json([
            'data' => $children,
        ]);
    }

    public function resetPassword(Request $request, int $id)
    {
        $mentor = $request->user()->mentor;

        if (!$mentor) {
            return response()->json(['message' => 'Профиль наставника не найден'], 403);
        }

        $child = Child::with('user')
            ->where('mentor_id', $mentor->id)
            ->where('id', $id)
            ->first();

        if (!$child || !$child->user) {
            return response()->json(['message' => 'Ребёнок не найден'], 404);
        }

        $password = Str::password(10, true, true, false, false);

        $child->user->password = Hash::make($password);
        $child->user->save();

        return response()->json([
            'data' => [
                'generated_password' => $password,
                'name' => $child->user->name,
            ],
            'message' => 'Пароль сгенерирован.',
        ]);
    }
}