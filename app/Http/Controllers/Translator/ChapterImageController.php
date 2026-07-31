<?php

namespace App\Http\Controllers\Translator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Translator\StoreChapterImageRequest;
use App\Models\Chapter;
use App\Services\StorageSettingsService;
use Illuminate\Http\JsonResponse;

class ChapterImageController extends Controller
{
    public function __construct(private StorageSettingsService $storage) {}

    public function store(StoreChapterImageRequest $request, Chapter $chapter): JsonResponse
    {
        $path = $this->storage->storeUploadedFile($request->file('image'), 'chapter-images');

        return response()->json([
            'url' => $this->storage->url($path),
        ]);
    }
}
