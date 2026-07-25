<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureDeviceId;
use App\Models\ChapterRead;
use App\Models\Novel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContinueReadingController extends Controller
{
    public function index(Request $request): Response
    {
        $deviceId = $request->attributes->get(EnsureDeviceId::COOKIE_NAME);

        $reads = ChapterRead::where('device_id', $deviceId)
            ->with('chapter:id,novel_id,chapter_number,title')
            ->get();

        $lastReadPerNovel = $reads
            ->filter(fn (ChapterRead $read) => $read->chapter !== null)
            ->groupBy('chapter.novel_id')
            ->map(fn ($group) => $group->sortByDesc('read_at')->first());

        $novels = Novel::whereIn('id', $lastReadPerNovel->keys())
            ->where('status', '!=', 'draft')
            ->get(['id', 'title', 'slug', 'cover_image']);

        $items = $novels->map(function (Novel $novel) use ($lastReadPerNovel) {
            $lastRead = $lastReadPerNovel->get($novel->id);

            return [
                'novel' => $novel->only(['id', 'title', 'slug', 'cover_image']),
                'lastChapter' => $lastRead->chapter->only(['id', 'chapter_number', 'title']),
                'readAt' => $lastRead->read_at,
            ];
        })->sortByDesc('readAt')->values();

        return Inertia::render('ContinueReading', [
            'items' => $items,
        ]);
    }
}
