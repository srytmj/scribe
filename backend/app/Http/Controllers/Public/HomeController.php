<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Models\Novel;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $novels = Novel::query()
            ->where('status', '!=', 'draft')
            ->when($request->filled('q'), function ($query) use ($request) {
                $search = $request->string('q');
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'ILIKE', "%{$search}%")
                        ->orWhereHas('altTitles', fn ($query) => $query->where('title', 'ILIKE', "%{$search}%"));
                });
            })
            ->when($request->filled('genre'), function ($query) use ($request) {
                $query->whereHas('genres', fn ($query) => $query->where('genres.slug', $request->string('genre')));
            })
            ->when($request->filled('tag'), function ($query) use ($request) {
                $query->whereHas('tags', fn ($query) => $query->where('tags.slug', $request->string('tag')));
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->with(['user:id,name,username', 'genres:id,name,slug'])
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Home', [
            'novels' => $novels,
            'filters' => $request->only(['q', 'genre', 'tag', 'status']),
            'availableGenres' => Genre::orderBy('name')->get(['id', 'name', 'slug']),
            'availableTags' => Tag::orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }
}
