<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EnsureDeviceId
{
    private const COOKIE_NAME = 'device_id';

    private const LIFETIME_MINUTES = 60 * 24 * 365 * 5;

    public function handle(Request $request, Closure $next): Response
    {
        $deviceId = $request->cookie(self::COOKIE_NAME);

        if (! $deviceId) {
            $deviceId = (string) Str::uuid();
            $request->cookies->set(self::COOKIE_NAME, $deviceId);
        }

        $response = $next($request);

        return $response->withCookie(cookie(
            name: self::COOKIE_NAME,
            value: $deviceId,
            minutes: self::LIFETIME_MINUTES,
            httpOnly: true,
        ));
    }
}
