<?php

use App\Http\Controllers\Admin\NovelController as AdminNovelController;
use App\Http\Controllers\Auth\SsoController;
use App\Http\Controllers\Translator\ChapterController;
use App\Http\Controllers\Translator\ChapterImageController;
use App\Http\Controllers\Translator\CreatorController;
use App\Http\Controllers\Translator\NovelController;
use App\Http\Controllers\Translator\VolumeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('ensure.device')->get('/', function () {
    $user = auth()->user();

    if (! $user) {
        return Inertia::render('Landing');
    }

    return redirect(match (true) {
        $user->isAdmin() => route('admin.dashboard'),
        $user->isTranslator() => route('translator.dashboard'),
        default => route('pending'),
    });
})->name('home');

// SSO — whitearchive.id
Route::get('/auth/redirect', [SsoController::class, 'redirect'])->name('sso.redirect');
Route::get('/auth/callback', [SsoController::class, 'callback'])->name('sso.callback');
Route::middleware('auth')->post('/logout', [SsoController::class, 'logout'])->name('logout');

// Banned & pending — auth required, not_banned skips /banned internally via routeIs()
Route::middleware(['auth', 'not_banned'])->group(function () {
    Route::get('/banned', fn () => Inertia::render('Auth/Banned'))->name('banned');
    Route::get('/pending', fn () => Inertia::render('Auth/Pending'))->name('pending');
});

// Translator area
Route::prefix('translator')->name('translator.')->middleware(['auth', 'not_banned', 'check.menu'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Translator/Dashboard'))->name('dashboard');

    Route::resource('novels', NovelController::class)->except(['show']);

    Route::post('novels/{novel}/volumes', [VolumeController::class, 'store'])->name('novels.volumes.store');
    Route::patch('volumes/{volume}', [VolumeController::class, 'update'])->name('novels.volumes.update');
    Route::delete('volumes/{volume}', [VolumeController::class, 'destroy'])->name('novels.volumes.destroy');

    Route::get('novels/{novel}/chapters/create', [ChapterController::class, 'create'])->name('novels.chapters.create');
    Route::post('novels/{novel}/chapters', [ChapterController::class, 'store'])->name('novels.chapters.store');
    Route::get('chapters/{chapter}/edit', [ChapterController::class, 'edit'])->name('chapters.edit');
    Route::put('chapters/{chapter}', [ChapterController::class, 'update'])->name('chapters.update');
    Route::patch('chapters/{chapter}/autosave', [ChapterController::class, 'autosave'])->name('chapters.autosave');
    Route::delete('chapters/{chapter}', [ChapterController::class, 'destroy'])->name('chapters.destroy');
    Route::post('chapters/{chapter}/images', [ChapterImageController::class, 'store'])->name('chapters.images.store');

    Route::get('creators/autocomplete', [CreatorController::class, 'autocomplete'])->name('creators.autocomplete');
});

// Admin area
Route::prefix('admin')->name('admin.')->middleware(['auth', 'not_banned', 'check.menu'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');

    Route::get('novels', [AdminNovelController::class, 'index'])->name('novels.index');
    Route::delete('novels/bulk', [AdminNovelController::class, 'bulkDestroy'])->name('novels.bulk-destroy');
});

// Pengaturan akun (translator & admin) — profil read-only dari SSO
Route::middleware(['auth', 'not_banned', 'check.menu'])
    ->get('/settings', fn () => Inertia::render('Settings/Index', [
        'sso_account_url' => config('sso.base_url').'/account',
    ]))
    ->name('settings.index');
