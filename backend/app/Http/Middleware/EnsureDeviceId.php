<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EnsureDeviceId
{
    public const COOKIE_NAME = 'device_id';

    public function handle(Request $request, Closure $next): Response
    {
        $deviceId = $request->cookie(self::COOKIE_NAME);

        if (! $deviceId) {
            $deviceId = (string) Str::uuid();
            $request->cookies->set(self::COOKIE_NAME, $deviceId);
            Cookie::queue(Cookie::make(self::COOKIE_NAME, $deviceId, 60 * 24 * 365 * 5));
        }

        $request->attributes->set(self::COOKIE_NAME, $deviceId);

        return $next($request);
    }
}
