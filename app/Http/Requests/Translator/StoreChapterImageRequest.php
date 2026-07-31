<?php

namespace App\Http\Requests\Translator;

use Illuminate\Foundation\Http\FormRequest;

class StoreChapterImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('chapter'));
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:4096'],
        ];
    }
}
