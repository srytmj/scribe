<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id', 'title', 'slug', 'synopsis', 'cover_image',
    'status', 'origin_language', 'translation_language',
])]
class Novel extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => 'string',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function volumes(): HasMany
    {
        return $this->hasMany(Volume::class);
    }

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class);
    }

    public function altTitles(): HasMany
    {
        return $this->hasMany(NovelAltTitle::class);
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'novel_genre');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'novel_tag');
    }

    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(Creator::class, 'novel_author');
    }

    public function illustrators(): BelongsToMany
    {
        return $this->belongsToMany(Creator::class, 'novel_illustrator');
    }
}
