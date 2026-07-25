<?php

namespace App\Http\Requests\Dashboard;

use Illuminate\Foundation\Http\FormRequest;

class StoreNovelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Novel::class);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'synopsis' => ['required', 'string'],
            'origin_language' => ['required', 'string', 'max:100'],
            'translation_language' => ['required', 'string', 'max:100'],
            'status' => ['sometimes', 'in:draft,ongoing,completed,hiatus,dropped'],
            'cover_image' => ['nullable', 'image', 'max:4096'],
            'alt_titles' => ['sometimes', 'array'],
            'alt_titles.*.language' => ['required_with:alt_titles', 'string', 'max:100'],
            'alt_titles.*.title' => ['required_with:alt_titles', 'string', 'max:255'],
            'authors' => ['sometimes', 'array'],
            'authors.*.id' => ['nullable', 'integer', 'exists:creators,id'],
            'authors.*.name' => ['required_with:authors', 'string', 'max:255'],
            'illustrators' => ['sometimes', 'array'],
            'illustrators.*.id' => ['nullable', 'integer', 'exists:creators,id'],
            'illustrators.*.name' => ['required_with:illustrators', 'string', 'max:255'],
            'genres' => ['sometimes', 'array'],
            'genres.*' => ['integer', 'exists:genres,id'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['integer', 'exists:tags,id'],
        ];
    }
}
