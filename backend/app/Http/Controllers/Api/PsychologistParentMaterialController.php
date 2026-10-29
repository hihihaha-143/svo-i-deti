<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParentMaterial;
use Illuminate\Http\Request;

class PsychologistParentMaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = ParentMaterial::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('preview', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'preview' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'is_published' => ['boolean'],
        ]);

        $material = ParentMaterial::create($validated);

        return response()->json($material, 201);
    }

    public function update(Request $request, ParentMaterial $material)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'preview' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'is_published' => ['boolean'],
        ]);

        $material->update($validated);

        return response()->json($material);
    }

    public function destroy(ParentMaterial $material)
    {
        $material->delete();

        return response()->json(null, 204);
    }

    public function togglePublish(ParentMaterial $material)
    {
        $material->update(['is_published' => !$material->is_published]);

        return response()->json($material);
    }
}