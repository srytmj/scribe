<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Sso\SsoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SsoController extends Controller
{
    public function __construct(private readonly SsoService $sso) {}

    public function login(): RedirectResponse
    {
        return redirect($this->sso->redirectUrl());
    }

    public function callback(Request $request): RedirectResponse
    {
        $user = $this->sso->handleCallback(
            $request->query('code', ''),
            $request->query('state'),
        );

        Auth::login($user);
        $request->session()->regenerate();

        $destination = match ($user->role) {
            'admin' => route('admin.index'),
            'translator' => route('dashboard.index'),
            default => route('home'),
        };

        return redirect()->intended($destination);
    }

    public function logout(Request $request): RedirectResponse
    {
        $logoutUrl = $this->sso->logoutUrl();

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect($logoutUrl);
    }
}
