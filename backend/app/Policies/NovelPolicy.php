<?php

namespace App\Policies;

use App\Models\Novel;
use App\Models\User;

class NovelPolicy
{
    public function create(User $user): bool
    {
        return $user->isTranslator();
    }

    public function update(User $user, Novel $novel): bool
    {
        return $user->id === $novel->user_id;
    }

    public function delete(User $user, Novel $novel): bool
    {
        return $user->id === $novel->user_id;
    }
}
