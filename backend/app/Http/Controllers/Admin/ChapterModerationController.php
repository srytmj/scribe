<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Services\Chapter\ChapterService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ChapterModerationController extends Controller
{
    public function __construct(private readonly ChapterService $chapters) {}

    public function index(): Response
    {
        $chapters = Chapter::with('novel:id,title,slug')
            ->orderByDesc('created_at')
            ->get(['id', 'novel_id', 'chapter_number', 'title', 'status', 'created_at']);

        return Inertia::render('Admin/Chapters', [
            'chapters' => $chapters,
        ]);
    }

    public function destroy(Chapter $chapter): RedirectResponse
    {
        $this->chapters->delete($chapter);

        return back()->with('success', 'Chapter removed.');
    }
}
