<?php

namespace App\Services\Novel;

use App\Models\Creator;
use App\Models\Novel;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NovelService
{
    public function create(User $owner, array $data, ?UploadedFile $cover): Novel
    {
        $novel = Novel::create([
            'user_id' => $owner->id,
            'title' => $data['title'],
            'slug' => $this->uniqueSlug($data['title']),
            'synopsis' => $data['synopsis'],
            'origin_language' => $data['origin_language'],
            'translation_language' => $data['translation_language'],
            'status' => $data['status'] ?? 'draft',
            'cover_image' => $cover ? $this->storeCover($cover) : null,
        ]);

        $this->syncAltTitles($novel, $data['alt_titles'] ?? []);
        $this->syncCreators($novel, 'authors', $data['authors'] ?? []);
        $this->syncCreators($novel, 'illustrators', $data['illustrators'] ?? []);
        $novel->genres()->sync($data['genres'] ?? []);
        $novel->tags()->sync($data['tags'] ?? []);

        return $novel;
    }

    public function update(Novel $novel, array $data, ?UploadedFile $cover): Novel
    {
        $novel->fill([
            'title' => $data['title'],
            'synopsis' => $data['synopsis'],
            'origin_language' => $data['origin_language'],
            'translation_language' => $data['translation_language'],
            'status' => $data['status'] ?? $novel->status,
        ]);

        if ($novel->isDirty('title')) {
            $novel->slug = $this->uniqueSlug($data['title'], $novel->id);
        }

        if ($cover) {
            $this->deleteCover($novel->cover_image);
            $novel->cover_image = $this->storeCover($cover);
        }

        $novel->save();

        $this->syncAltTitles($novel, $data['alt_titles'] ?? []);
        $this->syncCreators($novel, 'authors', $data['authors'] ?? []);
        $this->syncCreators($novel, 'illustrators', $data['illustrators'] ?? []);
        $novel->genres()->sync($data['genres'] ?? []);
        $novel->tags()->sync($data['tags'] ?? []);

        return $novel;
    }

    public function delete(Novel $novel): void
    {
        $this->deleteCover($novel->cover_image);
        $novel->delete();
    }

    private function syncAltTitles(Novel $novel, array $altTitles): void
    {
        $novel->altTitles()->delete();

        foreach ($altTitles as $altTitle) {
            if (empty($altTitle['language']) || empty($altTitle['title'])) {
                continue;
            }

            $novel->altTitles()->create([
                'language' => $altTitle['language'],
                'title' => $altTitle['title'],
            ]);
        }
    }

    /**
     * @param  'authors'|'illustrators'  $relation
     * @param  array<int, array{id?: int|null, name: string}>  $creators
     */
    private function syncCreators(Novel $novel, string $relation, array $creators): void
    {
        $ids = [];

        foreach ($creators as $creator) {
            $name = trim((string) ($creator['name'] ?? ''));

            if ($name === '') {
                continue;
            }

            $resolved = Creator::whereRaw('LOWER(name) = ?', [Str::lower($name)])->first()
                ?? Creator::create(['name' => $name]);

            $ids[] = $resolved->id;
        }

        $novel->{$relation}()->sync(array_unique($ids));
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 1;

        while (
            Novel::where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function storeCover(UploadedFile $cover): string
    {
        return $cover->store('covers', 'public');
    }

    private function deleteCover(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
