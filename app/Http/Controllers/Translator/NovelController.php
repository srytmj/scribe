<?php

namespace App\Http\Controllers\Translator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Translator\StoreNovelRequest;
use App\Http\Requests\Translator\UpdateNovelRequest;
use App\Models\Creator;
use App\Models\Genre;
use App\Models\Novel;
use App\Models\Tag;
use App\Services\StorageSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NovelController extends Controller
{
    public function __construct(private StorageSettingsService $storage) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Novel::class);

        $novels = $request->user()->novels()
            ->when(request('search'), fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when(request('status'), fn ($q, $s) => $q->where('status', $s))
            ->withCount(['volumes', 'chapters'])
            ->latest()
            ->paginate($this->perPage())
            ->withQueryString()
            ->through(fn (Novel $novel) => [
                'id' => $novel->id,
                'title' => $novel->title,
                'slug' => $novel->slug,
                'cover_url' => $this->storage->url($novel->cover_path),
                'status' => $novel->status,
                'volumes_count' => $novel->volumes_count,
                'chapters_count' => $novel->chapters_count,
                'updated_at' => $novel->updated_at->toDateString(),
            ]);

        return Inertia::render('Translator/Novels/Index', [
            'novels' => $novels,
            'filters' => request()->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Novel::class);

        return Inertia::render('Translator/Novels/Create', [
            'genres' => Genre::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreNovelRequest $request): RedirectResponse
    {
        $this->authorize('create', Novel::class);

        $data = $request->safe()->except(['cover', 'alt_titles', 'authors', 'illustrators', 'genre_ids', 'tags']);
        $data['user_id'] = $request->user()->id;
        $data['slug'] = $this->uniqueSlug($request->string('title')->toString());

        if ($request->hasFile('cover')) {
            $data['cover_path'] = $this->storage->storeUploadedFile($request->file('cover'), 'covers');
        }

        $novel = Novel::create($data);

        $this->syncAltTitles($novel, $request->input('alt_titles', []));
        $novel->authors()->sync($this->creatorIds($request->input('authors', [])));
        $novel->illustrators()->sync($this->creatorIds($request->input('illustrators', [])));
        $novel->genres()->sync($request->input('genre_ids', []));
        $novel->tags()->sync($this->tagIds($request->input('tags', [])));

        return redirect()->route('translator.novels.edit', $novel)
            ->with('success', 'Novel berhasil ditambahkan.');
    }

    public function edit(Novel $novel): Response
    {
        $this->authorize('update', $novel);

        $novel->load(['altTitles', 'authors', 'illustrators', 'genres', 'tags']);

        return Inertia::render('Translator/Novels/Edit', [
            'novel' => [
                ...$novel->only([
                    'id', 'title', 'slug', 'synopsis', 'status',
                    'origin_language', 'translation_language', 'is_mature',
                ]),
                'cover_url' => $this->storage->url($novel->cover_path),
                'alt_titles' => $novel->altTitles->map->only(['id', 'language', 'title']),
                'authors' => $novel->authors->pluck('name'),
                'illustrators' => $novel->illustrators->pluck('name'),
                'genre_ids' => $novel->genres->pluck('id'),
                'tags' => $novel->tags->pluck('name'),
            ],
            'genres' => Genre::orderBy('name')->get(['id', 'name']),
            'volumes' => $novel->volumes()
                ->orderBy('number')
                ->get(['id', 'number', 'title'])
                ->map(fn ($v) => [
                    'id' => $v->id,
                    'number' => $v->number,
                    'title' => $v->title,
                ]),
            'chapters' => $novel->chapters()
                ->orderBy('volume_id')
                ->orderBy('chapter_number')
                ->get(['id', 'volume_id', 'chapter_number', 'title', 'status'])
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'volume_id' => $c->volume_id,
                    'chapter_number' => $c->chapter_number,
                    'title' => $c->title,
                    'status' => $c->status,
                ]),
        ]);
    }

    public function update(UpdateNovelRequest $request, Novel $novel): RedirectResponse
    {
        $this->authorize('update', $novel);

        $data = $request->safe()->except(['cover', 'alt_titles', 'authors', 'illustrators', 'genre_ids', 'tags']);

        if ($request->hasFile('cover')) {
            if ($novel->cover_path) {
                $this->storage->delete($novel->cover_path);
            }
            $data['cover_path'] = $this->storage->storeUploadedFile($request->file('cover'), 'covers');
        }

        $novel->update($data);

        $this->syncAltTitles($novel, $request->input('alt_titles', []));
        $novel->authors()->sync($this->creatorIds($request->input('authors', [])));
        $novel->illustrators()->sync($this->creatorIds($request->input('illustrators', [])));
        $novel->genres()->sync($request->input('genre_ids', []));
        $novel->tags()->sync($this->tagIds($request->input('tags', [])));

        return redirect()->route('translator.novels.edit', $novel)
            ->with('success', 'Novel berhasil diperbarui.');
    }

    public function destroy(Novel $novel): RedirectResponse
    {
        $this->authorize('delete', $novel);

        if ($novel->cover_path) {
            $this->storage->delete($novel->cover_path);
        }

        $novel->delete();

        return redirect()->route('translator.novels.index')
            ->with('success', 'Novel berhasil dihapus.');
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 2;

        while (Novel::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function syncAltTitles(Novel $novel, array $altTitles): void
    {
        $novel->altTitles()->delete();

        foreach ($altTitles as $altTitle) {
            if (empty($altTitle['language']) || empty($altTitle['title'])) {
                continue;
            }

            $novel->altTitles()->create([
                'language' => $altTitle['language'],
                'title' => $altTitle['title'],
            ]);
        }
    }

    private function creatorIds(array $names): array
    {
        return collect($names)
            ->filter()
            ->map(fn (string $name) => Creator::firstOrCreate(['name' => trim($name)])->id)
            ->all();
    }

    private function tagIds(array $names): array
    {
        return collect($names)
            ->filter()
            ->map(fn (string $name) => Tag::firstOrCreate(['name' => trim($name)])->id)
            ->all();
    }
}
