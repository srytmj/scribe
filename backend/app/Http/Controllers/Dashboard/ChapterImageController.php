<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\StoreChapterImageRequest;
use App\Models\Novel;
use App\Services\Chapter\ChapterService;
use Illuminate\Http\JsonResponse;

class ChapterImageController extends Controller
{
    public function __construct(private readonly ChapterService $chapters) {}

    public function store(StoreChapterImageRequest $request, Novel $novel): JsonResponse
    {
        $url = $this->chapters->storeInlineImage($request->file('image'));

        return response()->json(['url' => $url]);
    }
}
