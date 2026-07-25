<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGenreRequest;
use App\Models\Genre;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GenreController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Genres', [
            'genres' => Genre::orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function store(StoreGenreRequest $request): RedirectResponse
    {
        $name = $request->validated()['name'];

        Genre::create([
            'name' => $name,
            'slug' => $this->uniqueSlug($name),
        ]);

        return back()->with('success', 'Genre created.');
    }

    public function destroy(Genre $genre): RedirectResponse
    {
        $genre->delete();

        return back()->with('success', 'Genre deleted.');
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 1;

        while (Genre::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
