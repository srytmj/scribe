<?php

use App\Http\Controllers\Admin\ChapterModerationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\GenreController as AdminGenreController;
use App\Http\Controllers\Admin\NovelModerationController;
use App\Http\Controllers\Admin\TagController as AdminTagController;
use App\Http\Controllers\Admin\TicketController as AdminTicketController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\SsoController;
use App\Http\Controllers\Dashboard\ChapterController;
use App\Http\Controllers\Dashboard\ChapterImageController;
use App\Http\Controllers\Dashboard\CreatorController;
use App\Http\Controllers\Dashboard\NovelController;
use App\Http\Controllers\Dashboard\TicketController as DashboardTicketController;
use App\Http\Controllers\Dashboard\VolumeController;
use App\Http\Controllers\Public\ChapterController as PublicChapterController;
use App\Http\Controllers\Public\ContinueReadingController;
use App\Http\Controllers\Public\FavoriteController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\NovelController as PublicNovelController;
use App\Http\Controllers\Public\TicketController as PublicTicketController;
use App\Http\Controllers\Public\TranslatorController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/novels/{slug}', [PublicNovelController::class, 'show'])->name('novels.show');
Route::get('/novels/{slug}/vol-{volumeNumber}/{chapterNumber}', [PublicChapterController::class, 'showInVolume'])
    ->name('novels.chapters.read.volume');
Route::get('/novels/{slug}/{chapterNumber}', [PublicChapterController::class, 'show'])->name('novels.chapters.read');

Route::get('/favorites', [FavoriteController::class, 'index'])->name('favorites.index');
Route::post('/favorites', [FavoriteController::class, 'store'])->name('favorites.store');
Route::delete('/favorites/{novel}', [FavoriteController::class, 'destroy'])->name('favorites.destroy');

Route::get('/continue-reading', [ContinueReadingController::class, 'index'])->name('continue-reading.index');

Route::get('/tickets', [PublicTicketController::class, 'create'])->name('tickets.create');
Route::post('/tickets', [PublicTicketController::class, 'store'])->middleware('throttle:tickets')->name('tickets.store');

Route::get('/translator/{username}', [TranslatorController::class, 'show'])->name('translator.show');

Route::get('/auth/login', [SsoController::class, 'login'])->name('sso.login');
Route::get('/auth/callback', [SsoController::class, 'callback'])->name('sso.callback');
Route::post('/auth/logout', [SsoController::class, 'logout'])->name('sso.logout');
Route::get('/auth/logout', [SsoController::class, 'logout']);

Route::middleware(['auth', 'role:translator'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/', [NovelController::class, 'index'])->name('index');
    Route::get('/novels/create', [NovelController::class, 'create'])->name('novels.create');
    Route::post('/novels', [NovelController::class, 'store'])->name('novels.store');
    Route::get('/novels/{novel}/edit', [NovelController::class, 'edit'])->name('novels.edit');
    Route::put('/novels/{novel}', [NovelController::class, 'update'])->name('novels.update');
    Route::delete('/novels/{novel}', [NovelController::class, 'destroy'])->name('novels.destroy');

    Route::get('/creators/search', [CreatorController::class, 'search'])->name('creators.search');

    Route::post('/novels/{novel}/volumes', [VolumeController::class, 'store'])->name('novels.volumes.store');
    Route::put('/novels/{novel}/volumes/{volume}', [VolumeController::class, 'update'])->name('novels.volumes.update');
    Route::delete('/novels/{novel}/volumes/{volume}', [VolumeController::class, 'destroy'])->name('novels.volumes.destroy');

    Route::get('/novels/{novel}/chapters', [ChapterController::class, 'index'])->name('novels.chapters.index');
    Route::get('/novels/{novel}/chapters/create', [ChapterController::class, 'create'])->name('novels.chapters.create');
    Route::post('/novels/{novel}/chapters', [ChapterController::class, 'store'])->name('novels.chapters.store');
    Route::get('/novels/{novel}/chapters/{chapter}/edit', [ChapterController::class, 'edit'])->name('novels.chapters.edit');
    Route::put('/novels/{novel}/chapters/{chapter}', [ChapterController::class, 'update'])->name('novels.chapters.update');
    Route::patch('/novels/{novel}/chapters/{chapter}/autosave', [ChapterController::class, 'autosave'])->name('novels.chapters.autosave');
    Route::delete('/novels/{novel}/chapters/{chapter}', [ChapterController::class, 'destroy'])->name('novels.chapters.destroy');
    Route::post('/novels/{novel}/chapters/images', [ChapterImageController::class, 'store'])->name('novels.chapters.images.store');

    Route::get('/tickets', [DashboardTicketController::class, 'create'])->name('tickets.create');
    Route::post('/tickets', [DashboardTicketController::class, 'store'])->name('tickets.store');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('index');

    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::put('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.role');

    Route::get('/novels', [NovelModerationController::class, 'index'])->name('novels.index');
    Route::delete('/novels/{novel}', [NovelModerationController::class, 'destroy'])->name('novels.destroy');

    Route::get('/chapters', [ChapterModerationController::class, 'index'])->name('chapters.index');
    Route::delete('/chapters/{chapter}', [ChapterModerationController::class, 'destroy'])->name('chapters.destroy');

    Route::get('/genres', [AdminGenreController::class, 'index'])->name('genres.index');
    Route::post('/genres', [AdminGenreController::class, 'store'])->name('genres.store');
    Route::delete('/genres/{genre}', [AdminGenreController::class, 'destroy'])->name('genres.destroy');

    Route::get('/tags', [AdminTagController::class, 'index'])->name('tags.index');
    Route::post('/tags', [AdminTagController::class, 'store'])->name('tags.store');
    Route::delete('/tags/{tag}', [AdminTagController::class, 'destroy'])->name('tags.destroy');

    Route::get('/tickets', [AdminTicketController::class, 'index'])->name('tickets.index');
    Route::put('/tickets/{ticket}', [AdminTicketController::class, 'update'])->name('tickets.update');
});
