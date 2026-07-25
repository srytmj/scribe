<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Novel;
use App\Services\Novel\NovelService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NovelModerationController extends Controller
{
    public function __construct(private readonly NovelService $novels) {}

    public function index(): Response
    {
        $novels = Novel::with('user:id,name,username')
            ->orderByDesc('created_at')
            ->get(['id', 'user_id', 'title', 'slug', 'status', 'created_at']);

        return Inertia::render('Admin/Novels', [
            'novels' => $novels,
        ]);
    }

    public function destroy(Novel $novel): RedirectResponse
    {
        $this->novels->delete($novel);

        return back()->with('success', 'Novel removed.');
    }
}
