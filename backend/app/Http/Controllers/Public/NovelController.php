<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureDeviceId;
use App\Models\ChapterRead;
use App\Models\Favorite;
use App\Models\Novel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NovelController extends Controller
{
    public function show(Request $request, string $slug): Response
    {
        $novel = Novel::where('slug', $slug)
            ->where('status', '!=', 'draft')
            ->with([
                'user:id,name,username',
                'altTitles',
                'authors:id,name',
                'illustrators:id,name',
                'genres:id,name,slug',
                'tags:id,name,slug',
                'volumes' => fn ($query) => $query->orderBy('number'),
                'volumes.chapters' => fn ($query) => $query->where('status', '!=', 'draft')->orderBy('chapter_number'),
                'chapters' => fn ($query) => $query->whereNull('volume_id')
                    ->where('status', '!=', 'draft')
                    ->orderBy('chapter_number'),
            ])
            ->firstOrFail();

        $deviceId = $request->attributes->get(EnsureDeviceId::COOKIE_NAME);

        $isFavorited = Favorite::where('device_id', $deviceId)
            ->where('novel_id', $novel->id)
            ->exists();

        $chapterIds = $novel->chapters->pluck('id')
            ->merge($novel->volumes->flatMap->chapters->pluck('id'));

        $readChapterIds = ChapterRead::where('device_id', $deviceId)
            ->whereIn('chapter_id', $chapterIds)
            ->pluck('chapter_id');

        return Inertia::render('Novels/Show', [
            'novel' => $novel,
            'isFavorited' => $isFavorited,
            'readChapterIds' => $readChapterIds,
        ]);
    }
}
