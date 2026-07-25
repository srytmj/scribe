<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class TranslatorController extends Controller
{
    public function show(string $username): Response
    {
        $translator = User::where('username', $username)
            ->where('role', 'translator')
            ->firstOrFail();

        $novels = $translator->novels()
            ->where('status', '!=', 'draft')
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'slug', 'cover_image', 'status']);

        return Inertia::render('TranslatorProfile', [
            'translator' => $translator->only(['name', 'username', 'avatar', 'bio', 'donation_url']),
            'novels' => $novels,
        ]);
    }
}
