<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParentRecommendation;
use Illuminate\Http\Request;

class PsychologistRecommendationController extends Controller
{
    public function index(Request $request)
    {
        $query = ParentRecommendation::with(['parent.user', 'child.user']);

        if ($request->filled('child_id')) {
            $query->where('child_id', $request->input('child_id'));
        }

        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->input('parent_id'));
        }

        if ($request->filled('status')) {
            $isRead = $request->input('status') === 'read';
            $query->where('is_read', $isRead);
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
            'parent_id' => ['required', 'exists:parents,id'],
            'child_id' => ['nullable', 'exists:children,id'],
            'text' => ['required', 'string'],
        ]);

        $rec = ParentRecommendation::create($validated);

        return response()->json($rec->load(['parent.user', 'child.user']), 201);
    }

    public function update(Request $request, ParentRecommendation $recommendation)
    {
        $validated = $request->validate([
            'text' => ['required', 'string'],
        ]);

        $recommendation->update($validated);

        return response()->json($recommendation->load(['parent.user', 'child.user']));
    }

    public function destroy(ParentRecommendation $recommendation)
    {
        $recommendation->delete();
        return response()->json(null, 204);
    }

    public function markAsUnread(ParentRecommendation $recommendation)
    {
        $recommendation->update([
            'is_read' => false,
            'read_at' => null,
        ]);
        return response()->json($recommendation->load(['parent.user', 'child.user']));
    }

    public function markAsReadByParent(ParentRecommendation $recommendation)
    {
        // Этот метод будет использоваться позже в ЛК родителя
        $recommendation->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
        return response()->json($recommendation->load(['parent.user', 'child.user']));
    }
}