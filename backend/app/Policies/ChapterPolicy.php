<?php

namespace App\Policies;

use App\Models\Chapter;
use App\Models\User;

class ChapterPolicy
{
    public function create(User $user): bool
    {
        return $user->isTranslator();
    }

    public function update(User $user, Chapter $chapter): bool
    {
        return $user->id === $chapter->novel->user_id;
    }

    public function delete(User $user, Chapter $chapter): bool
    {
        return $user->id === $chapter->novel->user_id;
    }
}
