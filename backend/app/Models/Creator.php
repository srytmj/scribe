<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name'])]
class Creator extends Model
{
    public function novelsAsAuthor(): BelongsToMany
    {
        return $this->belongsToMany(Novel::class, 'novel_author');
    }

    public function novelsAsIllustrator(): BelongsToMany
    {
        return $this->belongsToMany(Novel::class, 'novel_illustrator');
    }
}
