<?php

namespace App\Http\Requests\Dashboard;

use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChapterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Chapter::class)
            && $this->user()->can('update', $this->route('novel'));
    }

    public function rules(): array
    {
        return [
            'chapter_number' => ['required', 'numeric', 'min:0', 'max:999999.9'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'status' => ['sometimes', 'in:draft,on_revision,published'],
            'volume_id' => [
                'nullable',
                'integer',
                Rule::exists('volumes', 'id')->where('novel_id', $this->route('novel')->id),
            ],
        ];
    }

    public function withValidator(ValidatorContract $validator): void
    {
        $validator->after(function (ValidatorContract $validator) {
            if ($this->duplicateChapterNumberExists()) {
                $validator->errors()->add('chapter_number', 'A chapter with this number already exists in this volume.');
            }
        });
    }

    private function duplicateChapterNumberExists(): bool
    {
        $novel = $this->route('novel');
        $volumeId = $this->input('volume_id');
        $chapterNumber = $this->input('chapter_number');

        if ($chapterNumber === null) {
            return false;
        }

        return $novel->chapters()
            ->where('chapter_number', $chapterNumber)
            ->when(
                $volumeId,
                fn ($query) => $query->where('volume_id', $volumeId),
                fn ($query) => $query->whereNull('volume_id'),
            )
            ->exists();
    }
}
