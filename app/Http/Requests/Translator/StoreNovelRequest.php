<?php

namespace App\Http\Requests\Translator;

use App\Models\Novel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNovelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Novel::class);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'synopsis' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'ongoing', 'completed', 'hiatus', 'dropped'])],
            'origin_language' => ['nullable', 'string', 'max:100'],
            'translation_language' => ['nullable', 'string', 'max:100'],
            'is_mature' => ['boolean'],
            'cover' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],

            'alt_titles' => ['nullable', 'array'],
            'alt_titles.*.language' => ['required_with:alt_titles.*.title', 'string', 'max:100'],
            'alt_titles.*.title' => ['required_with:alt_titles.*.language', 'string', 'max:255'],

            'authors' => ['nullable', 'array'],
            'authors.*' => ['string', 'max:255'],
            'illustrators' => ['nullable', 'array'],
            'illustrators.*' => ['string', 'max:255'],

            'genre_ids' => ['nullable', 'array'],
            'genre_ids.*' => ['uuid', 'exists:genres,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
        ];
    }
}
