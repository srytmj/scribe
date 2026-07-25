<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateTicketRequest;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(): Response
    {
        $tickets = Ticket::with(['fromUser:id,name,username', 'toUser:id,name,username'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Admin/Tickets', [
            'tickets' => $tickets,
        ]);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): RedirectResponse
    {
        $ticket->update(['status' => $request->validated()['status']]);

        return back()->with('success', 'Ticket updated.');
    }
}
