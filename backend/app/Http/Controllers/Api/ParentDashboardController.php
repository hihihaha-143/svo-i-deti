<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\DailyTip;
use App\Models\ParentModel;
use App\Models\ParentRecommendation;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Http\Request;

class ParentDashboardController extends Controller
{
    private function getParent(Request $request): ?ParentModel
    {
        return ParentModel::where('user_id', $request->user()->id)->first();
    }

    public function children(Request $request)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $children = Child::with('user')
            ->where('parent_id', $parent->id)
            ->get()
            ->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->user->name,
                    'login' => $child->user->login,
                ];
            });

        return response()->json(['data' => $children]);
    }

    public function recommendations(Request $request)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $recommendations = ParentRecommendation::where('parent_id', $parent->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($rec) {
                return [
                    'id' => $rec->id,
                    'text' => $rec->text,
                    'created_at' => $rec->created_at,
                ];
            });

        return response()->json(['data' => $recommendations]);
    }

    public function tests(Request $request)
    {
        $parent = $this->getParent($request);
        if (!$parent) {
            return response()->json(['message' => 'Профиль родителя не найден'], 403);
        }

        $tests = Test::where('is_active', true)
            ->whereIn('for_whom', ['parent', 'both'])
            ->get()
            ->map(function ($test) use ($parent) {
                $attempt = TestAttempt::where('test_id', $test->id)
                    ->where('user_id', $parent->user_id)
                    ->where('is_completed', true)
                    ->exists();

                return [
                    'id' => $test->id,
                    'title' => $test->title,
                    'is_passed' => $attempt,
                ];
            });

        return response()->json(['data' => $tests]);
    }

    public function dailyTip(Request $request)
    {
        $tip = DailyTip::orderByDesc('created_at')->first();

        return response()->json([
            'data' => $tip ? ['text' => $tip->text] : null,
        ]);
    }
}