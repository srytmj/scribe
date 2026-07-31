<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Volume;

class VolumePolicy
{
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isTranslator();
    }

    public function update(User $user, Volume $volume): bool
    {
        return $user->isAdmin() || $volume->novel->user_id === $user->id;
    }

    public function delete(User $user, Volume $volume): bool
    {
        return $user->isAdmin() || $volume->novel->user_id === $user->id;
    }
}
