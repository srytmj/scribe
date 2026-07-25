<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureDeviceId;
use App\Models\Novel;
use App\Services\Chapter\ChapterService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    public function __construct(private readonly ChapterService $chapters) {}

    public function show(Request $request, string $slug, string $chapterNumber): Response
    {
        return $this->render($request, $slug, null, $chapterNumber);
    }

    public function showInVolume(Request $request, string $slug, string $volumeNumber, string $chapterNumber): Response
    {
        return $this->render($request, $slug, $volumeNumber, $chapterNumber);
    }

    private function render(Request $request, string $slug, ?string $volumeNumber, string $chapterNumber): Response
    {
        $novel = Novel::where('slug', $slug)->where('status', '!=', 'draft')->firstOrFail();

        $chapter = $novel->chapters()
            ->where('chapter_number', $chapterNumber)
            ->where('status', 'published')
            ->when(
                $volumeNumber !== null,
                fn ($query) => $query->whereHas('volume', fn ($query) => $query->where('number', $volumeNumber)),
                fn ($query) => $query->whereNull('volume_id'),
            )
            ->firstOrFail();

        $this->chapters->recordRead($request->attributes->get(EnsureDeviceId::COOKIE_NAME), $chapter);

        return Inertia::render('Novels/Chapter', [
            'novel' => $novel->only(['id', 'title', 'slug']),
            'chapter' => $chapter->only(['id', 'chapter_number', 'title', 'content']),
        ]);
    }
}
