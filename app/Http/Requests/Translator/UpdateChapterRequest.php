<?php

namespace App\Http\Requests\Translator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChapterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('chapter'));
    }

    public function messages(): array
    {
        return [
            'chapter_number.unique' => 'Nomor chapter ini sudah dipakai di volume yang sama.',
        ];
    }

    public function rules(): array
    {
        $chapter = $this->route('chapter');

        return [
            'volume_id' => [
                'nullable', 'uuid',
                Rule::exists('volumes', 'id')->where('novel_id', $chapter?->novel_id),
            ],
            'chapter_number' => [
                'required', 'numeric', 'min:0',
                Rule::unique('chapters', 'chapter_number')
                    ->where('novel_id', $chapter?->novel_id)
                    ->where('volume_id', $this->input('volume_id'))
                    ->ignore($chapter?->id),
            ],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'on_revision', 'published'])],
        ];
    }
}
