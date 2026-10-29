<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatTemplateCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ChatTemplateCategoryController extends Controller
{
    public function index()
    {
        return response()->json(ChatTemplateCategory::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:chat_template_categories,name'],
        ]);

        $category = ChatTemplateCategory::create($validated);

        return response()->json($category, 201);
    }

    public function update(Request $request, ChatTemplateCategory $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('chat_template_categories', 'name')->ignore($category->id)],
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy(ChatTemplateCategory $category)
    {
        if ($category->templates()->exists()) {
            return response()->json(['message' => 'Нельзя удалить категорию, в которой есть шаблоны'], 422);
        }

        $category->delete();

        return response()->json(null, 204);
    }
}