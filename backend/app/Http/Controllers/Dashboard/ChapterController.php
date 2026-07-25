<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\AutosaveChapterRequest;
use App\Http\Requests\Dashboard\StoreChapterRequest;
use App\Http\Requests\Dashboard\UpdateChapterRequest;
use App\Models\Chapter;
use App\Models\Novel;
use App\Services\Chapter\ChapterService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    public function __construct(private readonly ChapterService $chapters) {}

    public function index(Novel $novel): Response
    {
        $this->authorize('update', $novel);

        $chapters = $novel->chapters()
            ->orderBy('volume_id')
            ->orderBy('chapter_number')
            ->get(['id', 'volume_id', 'chapter_number', 'title', 'status', 'updated_at']);

        return Inertia::render('Dashboard/Chapters/Index', [
            'novel' => $novel->only(['id', 'title', 'slug']),
            'chapters' => $chapters,
        ]);
    }

    public function create(Novel $novel): Response
    {
        $this->authorize('update', $novel);

        return Inertia::render('Dashboard/Chapters/Create', [
            'novel' => $novel->only(['id', 'title', 'slug']),
            'volumes' => $novel->volumes()->orderBy('number')->get(['id', 'number', 'title']),
        ]);
    }

    public function store(StoreChapterRequest $request, Novel $novel): RedirectResponse
    {
        $chapter = $this->chapters->create($novel, $request->validated());

        return redirect()->route('dashboard.novels.chapters.edit', [$novel, $chapter])
            ->with('success', 'Chapter created.');
    }

    public function edit(Novel $novel, Chapter $chapter): Response
    {
        $this->authorize('update', $chapter);
        abort_unless($chapter->novel_id === $novel->id, 404);

        return Inertia::render('Dashboard/Chapters/Edit', [
            'novel' => $novel->only(['id', 'title', 'slug']),
            'volumes' => $novel->volumes()->orderBy('number')->get(['id', 'number', 'title']),
            'chapter' => $chapter,
        ]);
    }

    public function update(UpdateChapterRequest $request, Novel $novel, Chapter $chapter): RedirectResponse
    {
        abort_unless($chapter->novel_id === $novel->id, 404);

        $this->chapters->update($chapter, $request->validated());

        return redirect()->route('dashboard.novels.chapters.edit', [$novel, $chapter])
            ->with('success', 'Chapter updated.');
    }

    public function autosave(AutosaveChapterRequest $request, Novel $novel, Chapter $chapter): RedirectResponse
    {
        abort_unless($chapter->novel_id === $novel->id, 404);

        $this->chapters->autosave($chapter, $request->validated()['content']);

        return back();
    }

    public function destroy(Novel $novel, Chapter $chapter): RedirectResponse
    {
        $this->authorize('delete', $chapter);
        abort_unless($chapter->novel_id === $novel->id, 404);

        $this->chapters->delete($chapter);

        return redirect()->route('dashboard.novels.chapters.index', $novel)->with('success', 'Chapter deleted.');
    }
}
