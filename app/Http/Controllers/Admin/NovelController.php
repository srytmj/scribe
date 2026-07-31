<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Novel;
use App\Services\StorageSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NovelController extends Controller
{
    public function __construct(private StorageSettingsService $storage) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Novel::class);

        $novels = Novel::query()
            ->with('user:id,name')
            ->when(request('search'), fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when(request('status'), fn ($q, $s) => $q->where('status', $s))
            ->withCount(['volumes', 'chapters'])
            ->latest()
            ->paginate($this->perPage())
            ->withQueryString()
            ->through(fn (Novel $novel) => [
                'id' => $novel->id,
                'title' => $novel->title,
                'cover_url' => $this->storage->url($novel->cover_path),
                'status' => $novel->status,
                'volumes_count' => $novel->volumes_count,
                'chapters_count' => $novel->chapters_count,
                'translator_name' => $novel->user->name,
                'updated_at' => $novel->updated_at->toDateString(),
            ]);

        return Inertia::render('Admin/Novels/Index', [
            'novels' => $novels,
            'filters' => request()->only(['search', 'status']),
        ]);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['uuid', 'exists:novels,id'],
        ]);

        $novels = Novel::whereIn('id', $request->ids)->get();

        foreach ($novels as $novel) {
            $this->authorize('delete', $novel);
        }

        foreach ($novels as $novel) {
            if ($novel->cover_path) {
                $this->storage->delete($novel->cover_path);
            }
        }

        $count = $novels->count();
        Novel::whereIn('id', $request->ids)->delete();

        return redirect()->route('admin.novels.index')
            ->with('success', "{$count} novel berhasil dihapus.");
    }
}
