<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureDeviceId;
use App\Http\Requests\Public\StoreReaderTicketRequest;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Tickets/Create', [
            'translators' => User::where('role', 'translator')->orderBy('username')->get(['id', 'username', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Honeypot check happens before validation on purpose: a bot filling the
        // trap field should get an indistinguishable "success" response, not a
        // 422 that reveals the trap exists.
        if ($request->filled('website')) {
            return back()->with('success', 'Ticket submitted.');
        }

        $data = Validator::make(
            $request->all(),
            (new StoreReaderTicketRequest())->rules(),
        )->validate();

        Ticket::create([
            'type' => $data['type'],
            'from_type' => 'reader',
            'from_device_id' => $request->attributes->get(EnsureDeviceId::COOKIE_NAME),
            'to_type' => $data['to_type'],
            'to_user_id' => $data['to_user_id'] ?? null,
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status' => 'open',
        ]);

        return back()->with('success', 'Ticket submitted.');
    }
}
