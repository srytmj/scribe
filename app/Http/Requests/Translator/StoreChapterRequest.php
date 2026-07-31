<?php

namespace App\Http\Requests\Translator;

use App\Models\Chapter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChapterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Chapter::class);
    }

    public function messages(): array
    {
        return [
            'chapter_number.unique' => 'Nomor chapter ini sudah dipakai di volume yang sama.',
        ];
    }

    public function rules(): array
    {
        $novelId = $this->route('novel')?->id;

        return [
            'volume_id' => [
                'nullable', 'uuid',
                Rule::exists('volumes', 'id')->where('novel_id', $novelId),
            ],
            'chapter_number' => [
                'required', 'numeric', 'min:0',
                Rule::unique('chapters', 'chapter_number')
                    ->where('novel_id', $novelId)
                    ->where('volume_id', $this->input('volume_id')),
            ],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'on_revision', 'published'])],
        ];
    }
}
