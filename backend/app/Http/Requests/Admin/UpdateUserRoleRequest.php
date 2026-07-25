<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'in:pending,translator'],
        ];
    }

    public function withValidator(ValidatorContract $validator): void
    {
        $validator->after(function (ValidatorContract $validator) {
            $target = $this->route('user');

            if ($target instanceof \App\Models\User && $target->role === 'admin') {
                $validator->errors()->add('role', 'Admin role is managed via SSO and cannot be changed here.');
            }
        });
    }
}
