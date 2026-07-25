<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::orderBy('name')
            ->get(['id', 'name', 'username', 'email', 'avatar', 'sso_role', 'role', 'created_at']);

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        $user->update(['role' => $request->validated()['role']]);

        return back()->with('success', 'Role updated.');
    }
}
