<?php

namespace App\Providers;

use App\Http\Middleware\EnsureDeviceId;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('tickets', function (Request $request) {
            $key = $request->attributes->get(EnsureDeviceId::COOKIE_NAME) ?? $request->ip();

            return Limit::perMinute(5)->by($key);
        });
    }
}
