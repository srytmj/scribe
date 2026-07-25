<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureDeviceId;
use App\Http\Requests\Public\StoreFavoriteRequest;
use App\Models\Favorite;
use App\Models\Novel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteController extends Controller
{
    public function index(Request $request): Response
    {
        $deviceId = $request->attributes->get(EnsureDeviceId::COOKIE_NAME);

        $novels = Novel::whereIn('id', Favorite::where('device_id', $deviceId)->pluck('novel_id'))
            ->where('status', '!=', 'draft')
            ->with(['user:id,name,username', 'genres:id,name,slug'])
            ->get(['id', 'user_id', 'title', 'slug', 'cover_image', 'status']);

        return Inertia::render('Favorites', [
            'novels' => $novels,
        ]);
    }

    public function store(StoreFavoriteRequest $request): RedirectResponse
    {
        Favorite::firstOrCreate([
            'device_id' => $request->attributes->get(EnsureDeviceId::COOKIE_NAME),
            'novel_id' => $request->validated()['novel_id'],
        ]);

        return back();
    }

    public function destroy(Request $request, Novel $novel): RedirectResponse
    {
        Favorite::where('device_id', $request->attributes->get(EnsureDeviceId::COOKIE_NAME))
            ->where('novel_id', $novel->id)
            ->delete();

        return back();
    }
}
