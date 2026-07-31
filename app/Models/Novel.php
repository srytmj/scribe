<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Novel extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'anilist_id',
        'title',
        'slug',
        'synopsis',
        'cover_path',
        'status',
        'origin_language',
        'translation_language',
        'anilist_score',
        'is_mature',
    ];

    protected function casts(): array
    {
        return [
            'anilist_score' => 'decimal:2',
            'is_mature' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function altTitles(): HasMany
    {
        return $this->hasMany(NovelAltTitle::class);
    }

    public function volumes(): HasMany
    {
        return $this->hasMany(Volume::class);
    }

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class);
    }

    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(Creator::class, 'novel_author');
    }

    public function illustrators(): BelongsToMany
    {
        return $this->belongsToMany(Creator::class, 'novel_illustrator');
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'novel_genre');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'novel_tag');
    }
}
