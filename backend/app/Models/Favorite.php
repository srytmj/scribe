<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['device_id', 'novel_id'])]
class Favorite extends Model
{
    public function novel(): BelongsTo
    {
        return $this->belongsTo(Novel::class);
    }
}
