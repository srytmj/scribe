<?php

namespace App\Http\Requests\Translator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVolumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('volume'));
    }

    public function messages(): array
    {
        return [
            'number.unique' => 'Nomor volume ini sudah ada di novel ini.',
        ];
    }

    public function rules(): array
    {
        $volume = $this->route('volume');

        return [
            'number' => [
                'required', 'integer', 'min:1',
                Rule::unique('volumes', 'number')
                    ->where('novel_id', $volume?->novel_id)
                    ->ignore($volume?->id),
            ],
            'title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
