<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFavoriteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'novel_id' => [
                'required',
                'integer',
                Rule::exists('novels', 'id')->where(fn ($query) => $query->where('status', '!=', 'draft')),
            ],
        ];
    }
}
