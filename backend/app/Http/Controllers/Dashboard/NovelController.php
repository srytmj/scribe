<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\StoreNovelRequest;
use App\Http\Requests\Dashboard\UpdateNovelRequest;
use App\Models\Genre;
use App\Models\Novel;
use App\Models\Tag;
use App\Services\Novel\NovelService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NovelController extends Controller
{
    public function __construct(private readonly NovelService $novels) {}

    public function index(): Response
    {
        $novels = auth()->user()->novels()
            ->latest()
            ->get(['id', 'title', 'slug', 'cover_image', 'status', 'updated_at']);

        return Inertia::render('Dashboard/Index', [
            'novels' => $novels,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Novel::class);

        return Inertia::render('Dashboard/Novels/Create', [
            'availableGenres' => Genre::orderBy('name')->get(['id', 'name']),
            'availableTags' => Tag::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreNovelRequest $request): RedirectResponse
    {
        $novel = $this->novels->create(
            $request->user(),
            $request->validated(),
            $request->file('cover_image'),
        );

        return redirect()->route('dashboard.novels.edit', $novel)
            ->with('success', 'Novel created.');
    }

    public function edit(Novel $novel): Response
    {
        $this->authorize('update', $novel);

        $novel->load([
            'altTitles', 'authors:id,name', 'illustrators:id,name', 'genres:id,name', 'tags:id,name',
            'volumes' => fn ($query) => $query->orderBy('number'),
        ]);

        return Inertia::render('Dashboard/Novels/Edit', [
            'novel' => $novel,
            'availableGenres' => Genre::orderBy('name')->get(['id', 'name']),
            'availableTags' => Tag::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateNovelRequest $request, Novel $novel): RedirectResponse
    {
        $this->novels->update($novel, $request->validated(), $request->file('cover_image'));

        return redirect()->route('dashboard.novels.edit', $novel)
            ->with('success', 'Novel updated.');
    }

    public function destroy(Novel $novel): RedirectResponse
    {
        $this->authorize('delete', $novel);

        $this->novels->delete($novel);

        return redirect()->route('dashboard.index')->with('success', 'Novel deleted.');
    }
}
