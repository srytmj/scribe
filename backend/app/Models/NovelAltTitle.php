<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['novel_id', 'language', 'title'])]
class NovelAltTitle extends Model
{
    public function novel(): BelongsTo
    {
        return $this->belongsTo(Novel::class);
    }
}
