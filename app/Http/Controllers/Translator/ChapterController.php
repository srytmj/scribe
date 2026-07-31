<?php

namespace App\Http\Controllers\Translator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Translator\AutosaveChapterRequest;
use App\Http\Requests\Translator\StoreChapterRequest;
use App\Http\Requests\Translator\UpdateChapterRequest;
use App\Models\Chapter;
use App\Models\Novel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    public function create(Novel $novel): Response
    {
        $this->authorize('update', $novel);
        $this->authorize('create', Chapter::class);

        return Inertia::render('Translator/Chapters/Create', [
            'novel' => $novel->only(['id', 'title']),
            'volumes' => $novel->volumes()->orderBy('number')->get(['id', 'number', 'title']),
        ]);
    }

    public function store(StoreChapterRequest $request, Novel $novel): RedirectResponse
    {
        $this->authorize('update', $novel);
        $this->authorize('create', Chapter::class);

        $data = $request->validated();
        $data['published_at'] = $data['status'] === 'published' ? now() : null;

        $chapter = $novel->chapters()->create($data);

        return redirect()->route('translator.chapters.edit', $chapter)
            ->with('success', 'Chapter berhasil ditambahkan.');
    }

    public function edit(Chapter $chapter): Response
    {
        $this->authorize('update', $chapter);

        $chapter->load('novel');

        return Inertia::render('Translator/Chapters/Edit', [
            'chapter' => [
                ...$chapter->only(['id', 'novel_id', 'volume_id', 'chapter_number', 'title', 'content', 'status']),
                'last_autosaved_at' => $chapter->last_autosaved_at?->toIso8601String(),
            ],
            'novel' => $chapter->novel->only(['id', 'title']),
            'volumes' => $chapter->novel->volumes()->orderBy('number')->get(['id', 'number', 'title']),
        ]);
    }

    public function update(UpdateChapterRequest $request, Chapter $chapter): RedirectResponse
    {
        $this->authorize('update', $chapter);

        $data = $request->validated();

        if ($data['status'] === 'published' && ! $chapter->published_at) {
            $data['published_at'] = now();
        }

        $chapter->update($data);

        return redirect()->route('translator.chapters.edit', $chapter)
            ->with('success', 'Chapter berhasil disimpan.');
    }

    public function autosave(AutosaveChapterRequest $request, Chapter $chapter): JsonResponse
    {
        $this->authorize('update', $chapter);

        $chapter->update([
            ...$request->validated(),
            'last_autosaved_at' => now(),
        ]);

        return response()->json([
            'last_autosaved_at' => $chapter->last_autosaved_at->toIso8601String(),
        ]);
    }

    public function destroy(Chapter $chapter): RedirectResponse
    {
        $this->authorize('delete', $chapter);

        $novelId = $chapter->novel_id;
        $chapter->delete();

        return redirect()->route('translator.novels.edit', $novelId)
            ->with('success', 'Chapter berhasil dihapus.');
    }
}
