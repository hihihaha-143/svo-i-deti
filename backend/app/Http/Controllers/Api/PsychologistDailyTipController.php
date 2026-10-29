<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyTip;
use Illuminate\Http\Request;

class PsychologistDailyTipController extends Controller
{
    public function index(Request $request)
    {
        $query = DailyTip::query();

        if ($request->filled('search')) {
            $query->where('text', 'like', '%' . $request->input('search') . '%');
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(15)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => ['required', 'string'],
        ]);

        $tip = DailyTip::create($validated);

        return response()->json($tip, 201);
    }

    public function update(Request $request, DailyTip $tip)
    {
        $validated = $request->validate([
            'text' => ['required', 'string'],
        ]);

        $tip->update($validated);

        return response()->json($tip);
    }

    public function destroy(DailyTip $tip)
    {
        $tip->delete();

        return response()->json(null, 204);
    }
}