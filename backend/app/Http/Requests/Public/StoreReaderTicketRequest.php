<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReaderTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:bug,feature_request,chapter_request,other'],
            'to_type' => ['required', 'string', 'in:superadmin,translator'],
            'to_user_id' => [
                'required_if:to_type,translator',
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('role', 'translator')),
            ],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
        ];
    }

    public function isHoneypotTripped(): bool
    {
        return $this->filled('website');
    }
}
