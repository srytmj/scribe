# Changelog

## 2026-07-31 — Fase 1: Novel & Chapter Core

- Migration & model `novels`, `novel_alt_titles`, `creators` (+ pivot `novel_author`/`novel_illustrator`), `genres`/`tags` (+ pivot), `volumes`, `chapters`. `GenreSeeder` (taksonomi tetap, 19 genre).
- `NovelPolicy`/`ChapterPolicy`/`VolumePolicy` — pola ownership `admin || milik sendiri`, ditegakkan lewat `AuthorizesRequests` di base `Controller` (+ `perPage()` helper).
- Translator: CRUD novel penuh (judul, judul alternatif repeatable, cover via `StorageSettingsService`, author/illustrator lewat `CreatorAutocomplete` create-if-not-exist, genre toggle dari taksonomi tetap, tag bebas) di `Translator/Novels/{Index,Create,Edit}.tsx`.
- Translator: kelola volume inline di halaman Edit novel (dialog tambah/edit, tanpa halaman terpisah).
- Translator: CRUD chapter (`Translator/Chapters/{Create,Edit}.tsx`) — metadata dulu (nomor/judul/volume/status) baru masuk editor; `ChapterEditor.tsx` (Tiptap StarterKit + sisip gambar via `ChapterImageController`) dengan autosave debounced 2 detik (axios, bukan Inertia visit, supaya kursor editor tidak reset).
- Admin: `Admin/Novels/Index.tsx` — moderasi lintas translator, bulk delete dengan dialog konfirmasi.
- Verifikasi: `migrate:fresh --seed` OK, `tsc --noEmit` 0 error, `npm run build` OK, `route:list` 33 routes, `php artisan test` 9 passed/35 assertions (test baru `tests/Feature/Translator/NovelManagementTest.php` — cover create novel+relasi, ownership 403, pending role diblokir `check.menu`, volume/chapter CRUD, autosave, transisi `published_at`, bulk delete admin, creator autocomplete, upload gambar inline).

## 2026-07-30 — Fase 0: Fondasi

- Laravel 12 di-scaffold ke root project (bukan `backend/`), Inertia v2 + React 19 + TypeScript + Tailwind v4 + shadcn/ui (Base UI, style `base-nova`) terpasang dan berhasil build (`npm run build`, `tsc --noEmit` 0 error).
- Migration `users` (uuid, sso fields, role `pending`/`translator`/`admin`, ban fields, soft delete) + Spatie Permission terpasang dan role ter-seed.
- SSO whitearchive.id (`SsoController`): redirect/callback PKCE, role mapping (`superadmin`→`admin`, `user` login pertama→`pending`), logout 2 tahap.
- `EnsureDeviceId` (cookie `device_id` httpOnly untuk reader anonim) dan `EnsureNotBanned` middleware.
- Menu system: migration `menus`, `Menu` model, `MenuSeeder` (nav admin & translator sesuai `AGENT.md`), `CheckMenuAccess` middleware.
- `StorageSettingsService` + migration `storage_settings` (driver local/s3, `secret_access_key` encrypted).
- `bootstrap/app.php` (middleware aliases, redirect guest ke SSO, exception → halaman `Error`), `HandleInertiaRequests` (share `auth.user`, `menus`, `flash`).
- Layouts dasar `AdminLayout`, `TranslatorLayout`, `PublicLayout` + shared components `PageHeader`, `Pagination`, `EmptyState`, `StatusBadge` (Novel/Chapter/Ticket).
- Halaman infra: `Landing`, `Error`, `Maintenance`, `Auth/Banned`, `Auth/Pending` (baru — role `pending` menunggu grant admin, tidak ada di MALAS), `Settings/Index`, placeholder `Admin/Dashboard` & `Translator/Dashboard`.
- Verifikasi: `migrate:fresh --seed` OK, `route:list` 14 routes, `tsc --noEmit` 0 error, `php artisan test` 2 passed, smoke test manual (curl) untuk `/`, `/auth/redirect`, `/banned`, `/admin/dashboard`.

## 2026-07-26 — Rebuild total mengikuti arsitektur MALAS

- Ganti seluruh konvensi dokumentasi & workflow dari sistem tiket (`docs/tickets/TASK-XXX.md`, `SESSION-PROMPTS.md` PM/DEV/QA) menjadi pola project sister MALAS: `AGENT.md`, `CLAUDE.md` (root), `QA.md` (trigger `cek`), `docs/prd.md`, `docs/ARCHITECTURE.md`, `docs/FLOWS.md`, `docs/PHASES.md`.
- Stack di-align ke MALAS: Laravel 12, Inertia v2, React 19, shadcn/ui (Base UI), Tailwind v4, Spatie Permission, UUID PK, soft delete.
- Fitur infrastruktur di-adopsi: Menu Management, Announcements, Activity Log, Storage & Database Backup via UI, Command Palette/Global Search, Undo-toast, AniList metadata import (diadaptasi untuk light novel, media type `NOVEL`).
- Keputusan arsitektur yang TETAP dipertahankan dari desain sebelumnya (beda dari MALAS secara sengaja): reader 100% anonim tanpa login/akun (tracking device-based), tidak ada fitur Loans/peminjaman, tidak ada Collection/personal rating reader.
- Semua tiket lama (TASK-001 s/d TASK-018, BUG-001) dihapus — statusnya di-superscede oleh breakdown fase baru di `docs/PHASES.md`.

## 2026-07-23 — Pivot ke light novel CMS

- Ganti total dari project awal (file-to-markdown converter tool) menjadi Scribe (Light Novel Publishing CMS).
