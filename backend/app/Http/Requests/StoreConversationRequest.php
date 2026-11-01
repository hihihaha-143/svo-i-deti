<?php

namespace App\Http\Requests;

use App\Models\Conversation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in([
                Conversation::TYPE_CHILD_PSYCHOLOGIST,
                Conversation::TYPE_CHILD_MENTOR,
                Conversation::TYPE_PARENT_PSYCHOLOGIST,
            ])],
            'participant_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }
}