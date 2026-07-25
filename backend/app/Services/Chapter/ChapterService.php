<?php

namespace App\Services\Chapter;

use App\Models\Chapter;
use App\Models\ChapterRead;
use App\Models\Novel;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ChapterService
{
    public function create(Novel $novel, array $data): Chapter
    {
        $status = $data['status'] ?? 'draft';

        return $novel->chapters()->create([
            'volume_id' => $data['volume_id'] ?? null,
            'chapter_number' => $data['chapter_number'],
            'title' => $data['title'] ?? null,
            'content' => $data['content'],
            'status' => $status,
            'published_at' => $status === 'published' ? now() : null,
        ]);
    }

    public function update(Chapter $chapter, array $data): Chapter
    {
        $newStatus = $data['status'] ?? $chapter->status;

        $chapter->fill([
            'volume_id' => $data['volume_id'] ?? null,
            'chapter_number' => $data['chapter_number'],
            'title' => $data['title'] ?? null,
            'content' => $data['content'],
            'status' => $newStatus,
        ]);

        if ($newStatus === 'published' && $chapter->published_at === null) {
            $chapter->published_at = now();
        }

        $chapter->save();

        return $chapter;
    }

    public function autosave(Chapter $chapter, string $content): Chapter
    {
        $chapter->update([
            'content' => $content,
            'last_autosaved_at' => now(),
        ]);

        return $chapter;
    }

    public function delete(Chapter $chapter): void
    {
        $chapter->delete();
    }

    public function storeInlineImage(UploadedFile $image): string
    {
        $path = $image->store('chapter-images', 'public');

        return Storage::disk('public')->url($path);
    }

    public function recordRead(string $deviceId, Chapter $chapter): void
    {
        ChapterRead::updateOrCreate(
            ['device_id' => $deviceId, 'chapter_id' => $chapter->id],
            ['read_at' => now()],
        );
    }
}
