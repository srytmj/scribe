<?php

namespace App\Http\Requests\Translator;

use App\Models\Volume;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVolumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Volume::class);
    }

    public function messages(): array
    {
        return [
            'number.unique' => 'Nomor volume ini sudah ada di novel ini.',
        ];
    }

    public function rules(): array
    {
        $novelId = $this->route('novel')?->id;

        return [
            'number' => [
                'required', 'integer', 'min:1',
                Rule::unique('volumes', 'number')->where('novel_id', $novelId),
            ],
            'title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
