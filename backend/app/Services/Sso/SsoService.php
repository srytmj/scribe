<?php

namespace App\Services\Sso;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class SsoService
{
    private const SESSION_STATE_KEY = 'sso_state';

    private const SESSION_VERIFIER_KEY = 'sso_code_verifier';

    public function redirectUrl(): string
    {
        $codeVerifier = Str::random(64);
        $codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');
        $state = Str::random(40);

        session([
            self::SESSION_VERIFIER_KEY => $codeVerifier,
            self::SESSION_STATE_KEY => $state,
        ]);

        $query = http_build_query([
            'response_type' => 'code',
            'client_id' => config('sso.client_id'),
            'redirect_uri' => config('sso.redirect_uri'),
            'scope' => 'profile:read',
            'code_challenge' => $codeChallenge,
            'code_challenge_method' => 'S256',
            'state' => $state,
        ]);

        return config('sso.base_url')."/oauth/authorize?{$query}";
    }

    public function handleCallback(string $code, ?string $state): User
    {
        if (! $state || $state !== session(self::SESSION_STATE_KEY)) {
            // TEMPORARY diagnostic logging — remove once the state-mismatch
            // root cause is confirmed and fixed.
            Log::warning('SSO callback state mismatch', [
                'session_id' => session()->getId(),
                'incoming_state' => $state,
                'stored_state' => session(self::SESSION_STATE_KEY),
                'session_has_state_key' => session()->has(self::SESSION_STATE_KEY),
                'session_driver' => config('session.driver'),
                'session_cookie_config_name' => config('session.cookie'),
                'incoming_cookie_names' => array_keys(request()->cookies->all()),
                'incoming_session_cookie_present' => request()->cookies->has(config('session.cookie')),
                'request_is_secure' => request()->isSecure(),
                'request_scheme_and_host' => request()->getSchemeAndHttpHost(),
            ]);

            abort(403, 'Invalid state');
        }

        $codeVerifier = session(self::SESSION_VERIFIER_KEY);
        session()->forget([self::SESSION_STATE_KEY, self::SESSION_VERIFIER_KEY]);

        $tokenResponse = Http::asForm()->post(config('sso.base_url').'/oauth/token', [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => config('sso.redirect_uri'),
            'client_id' => config('sso.client_id'),
            'client_secret' => config('sso.client_secret'),
            'code_verifier' => $codeVerifier,
        ]);

        if ($tokenResponse->failed()) {
            throw new RuntimeException('SSO token exchange failed: '.$tokenResponse->body());
        }

        $token = $tokenResponse->json();

        $profileResponse = Http::withToken($token['access_token'])
            ->get(config('sso.base_url').'/api/user');

        if ($profileResponse->failed()) {
            throw new RuntimeException('SSO profile fetch failed: '.$profileResponse->body());
        }

        $profile = $profileResponse->json();

        return $this->syncUser($profile, $token);
    }

    public function refreshToken(User $user): void
    {
        $tokenResponse = Http::asForm()->post(config('sso.base_url').'/oauth/token', [
            'grant_type' => 'refresh_token',
            'refresh_token' => $user->refresh_token,
            'client_id' => config('sso.client_id'),
            'client_secret' => config('sso.client_secret'),
        ]);

        if ($tokenResponse->failed()) {
            throw new RuntimeException('SSO token refresh failed: '.$tokenResponse->body());
        }

        $token = $tokenResponse->json();

        $user->update([
            'access_token' => $token['access_token'],
            'refresh_token' => $token['refresh_token'],
            'token_expires_at' => now()->addSeconds($token['expires_in'] ?? 3600),
        ]);
    }

    public function logoutUrl(): string
    {
        $redirectUri = urlencode(url('/'));

        return config('sso.base_url')."/logout?redirect_uri={$redirectUri}";
    }

    private function syncUser(array $profile, array $token): User
    {
        $ssoRole = $profile['role']['slug'] ?? $profile['role'] ?? 'user';

        $existing = User::where('sso_id', $profile['id'])->first();

        $localRole = $ssoRole === 'superadmin'
            ? 'admin'
            : ($existing?->role ?? 'pending');

        $user = User::updateOrCreate(
            ['sso_id' => $profile['id']],
            [
                'name' => $profile['name'],
                'username' => $profile['username'],
                'email' => $profile['email'],
                'avatar' => $profile['avatar'] ?? null,
                'sso_role' => $ssoRole,
                'role' => $localRole,
                'access_token' => $token['access_token'],
                'refresh_token' => $token['refresh_token'],
                'token_expires_at' => now()->addSeconds($token['expires_in'] ?? 3600),
            ]
        );

        return $user;
    }
}
