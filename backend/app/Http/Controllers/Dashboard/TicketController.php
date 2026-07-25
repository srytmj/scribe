<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\StoreTranslatorTicketRequest;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Dashboard/Tickets/Create');
    }

    public function store(StoreTranslatorTicketRequest $request): RedirectResponse
    {
        Ticket::create([
            'type' => $request->validated()['type'],
            'from_type' => 'translator',
            'from_user_id' => $request->user()->id,
            'to_type' => 'superadmin',
            'subject' => $request->validated()['subject'],
            'message' => $request->validated()['message'],
            'status' => 'open',
        ]);

        return redirect()->route('dashboard.index')->with('success', 'Ticket submitted.');
    }
}
