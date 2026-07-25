<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Novel;
use App\Models\Ticket;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Index', [
            'stats' => [
                'activeTranslators' => User::where('role', 'translator')->count(),
                'pendingUsers' => User::where('role', 'pending')->count(),
                'releasedNovels' => Novel::where('status', '!=', 'draft')->count(),
                'publishedChapters' => Chapter::where('status', 'published')->count(),
                'openTickets' => Ticket::open()->count(),
            ],
        ]);
    }
}
