<?php

namespace App\Http\Requests\Dashboard;

use Illuminate\Foundation\Http\FormRequest;

class AutosaveChapterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('chapter'));
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string'],
        ];
    }
}
