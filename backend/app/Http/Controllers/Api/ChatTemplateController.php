<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatTemplate;
use Illuminate\Http\Request;

class ChatTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = ChatTemplate::with('category');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('text', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        return response()->json($query->orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'text' => ['required', 'string'],
            'category_id' => ['required', 'exists:chat_template_categories,id'],
        ]);

        $template = ChatTemplate::create($validated);

        return response()->json($template->load('category'), 201);
    }

    public function update(Request $request, ChatTemplate $chatTemplate)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'text' => ['required', 'string'],
            'category_id' => ['required', 'exists:chat_template_categories,id'],
        ]);

        $chatTemplate->update($validated);

        return response()->json($chatTemplate->load('category'));
    }

    public function destroy(ChatTemplate $chatTemplate)
    {
        $chatTemplate->delete();

        return response()->json(null, 204);
    }
}