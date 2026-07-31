<?php

namespace App\Policies;

use App\Models\Novel;
use App\Models\User;

class NovelPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Novel $novel): bool
    {
        return $user->isAdmin() || $novel->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isTranslator();
    }

    public function update(User $user, Novel $novel): bool
    {
        return $user->isAdmin() || $novel->user_id === $user->id;
    }

    public function delete(User $user, Novel $novel): bool
    {
        return $user->isAdmin() || $novel->user_id === $user->id;
    }
}
