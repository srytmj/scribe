<?php

namespace App\Http\Requests\Dashboard;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVolumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('novel'));
    }

    public function rules(): array
    {
        return [
            'number' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('volumes')
                    ->where('novel_id', $this->route('novel')->id)
                    ->ignore($this->route('volume')->id),
            ],
            'title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
