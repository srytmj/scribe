<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'novel_id', 'volume_id', 'chapter_number', 'title', 'content',
    'status', 'published_at', 'last_autosaved_at',
])]
class Chapter extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'chapter_number' => 'decimal:1',
            'published_at' => 'datetime',
            'last_autosaved_at' => 'datetime',
        ];
    }

    public function novel(): BelongsTo
    {
        return $this->belongsTo(Novel::class);
    }

    public function volume(): BelongsTo
    {
        return $this->belongsTo(Volume::class);
    }
}
