# CLAUDE.md - Scribe (Light Novel Publishing CMS)

## Project Overview

Scribe adalah platform CMS publishing light novel terpusat (bukan subdomain per translator) untuk freelance translator dan reader.
Translator & admin login via SSO whitearchive.id. Reader sepenuhnya anonim, tanpa akun, tracking berbasis device.

## Repo Structure

```
/
  backend/    Laravel 11 + Inertia.js (monolith — frontend di-serve dari sini)
  docs/       PRD, SRS, STRUCTURE, TODO, tickets
  scripts/    deploy.sh, update.sh
  logs/       sync and deploy logs (gitignored)
```

---

<!-- STACK_START -->
## Stack (auto-synced from SRS.md)

- Backend: Laravel 11
- Database: PostgreSQL
- Frontend: Inertia.js + React
- UI: Shadcn UI
- Rich Text / Blog Editor: Tiptap (chapter content, support sisip gambar)
- Auth: SSO whitearchive.id (OAuth2 Authorization Code + PKCE) — no local password
- Storage: Local disk (MVP) → S3/R2 (later) via Laravel Filesystem
- Domain (staging): scribe.suryatmaja.dev
- Domain (production, planned): scribe.whitearchive.id
<!-- STACK_END -->

---

## Roles

| Role | Sumber | Deskripsi |
|------|--------|-----------|
| Reader | — (anonim) | Tanpa login. Browse, baca, favorite, continue reading — semua device-based via cookie/localStorage `device_id`. |
| `pending` | SSO `user` (login pertama) | Login sukses tapi belum punya akses dashboard. Menunggu admin grant. |
| `translator` | Local Scribe (di-grant admin) | Bisa manage novel & chapter miliknya. |
| `admin` | SSO `superadmin` (auto-mapped) | Full access ke Scribe: dashboard admin, role management, moderasi. |

**Role SSO ≠ Role Scribe.** SSO cuma punya `user`/`superadmin`. Scribe simpan role lokal sendiri di kolom `users.role` (`pending`/`translator`/`admin`), terpisah dari `users.sso_role` yang cuma disync sebagai referensi.

---

## Auth: SSO Integration

Wajib pakai OAuth2 Authorization Code + PKCE ke `sso.whitearchive.id`. Referensi lengkap: `AI_INTEGRATION.md` di repo `sso.whitearchive`.

### Env Vars (backend/.env)

```
SSO_CLIENT_ID=xxx
SSO_CLIENT_SECRET=xxx
SSO_REDIRECT_URI=https://scribe.suryatmaja.dev/auth/callback
SSO_BASE_URL=https://sso.whitearchive.id
```

### Constraints

- PKCE wajib — tidak ada fallback auth method lain.
- `state` parameter divalidasi server-side (session), bukan cookie/localStorage.
- Access token (60 menit) & refresh token (30 hari, single-use) disimpan **terenkripsi** di server, tidak pernah dikirim ke client.
- Refresh token di-rotate tiap dipakai.
- **Logout wajib 2 tahap**: (1) hapus session lokal, (2) redirect ke `SSO_BASE_URL/logout` dengan `redirect_uri`. Skip tahap 2 = SSO session masih hidup = auto-login di percobaan berikutnya.
- Profile sync (`name`, `username`, `email`, `sso_role`) terjadi tiap login — jangan biarkan data lokal basi.
- Avatar dari SSO **belum tersedia** — pakai placeholder default di UI. Jangan bangun fitur upload/edit avatar sampai ada briefing lanjutan.
- Admin **tidak boleh** bisa edit nama/email/avatar user di Scribe — itu domain SSO. Admin cuma boleh ubah `users.role` lokal.

---

## Backend (Laravel + Inertia)

### Constraints

- Inertia.js sebagai jembatan Laravel ↔ React. Controller return `Inertia::render()`.
- Authorization wajib via Laravel Policies — translator hanya boleh modify novel/chapter miliknya sendiri.
- Tidak ada publish-approval flow — translator publish novel/chapter langsung (platform terpusat, bukan subdomain per translator).
- Cover image disimpan di local disk (MVP) via Laravel Filesystem, path relatif.
- Chapter content disimpan dari Tiptap (markdown/JSON), support gambar inline.
- Chapter punya autosave — endpoint `PATCH .../chapters/{id}/autosave` update `content` + `last_autosaved_at` tanpa mengubah `status`.
- `chapter_number` pakai `decimal(8,1)` — mendukung nomor pecahan (1.5) untuk side story/interlude.
- `volume_id` di tabel chapters nullable — volume opsional.
- Author & illustrator disimpan sebagai entity (`creators`), bukan free text — resolve via autocomplete, create-if-not-exist.
- Reader (favorite, chapter_reads) di-key oleh `device_id`, tidak pernah terikat ke `users`.

### Commands

```bash
cd backend
composer install
php artisan migrate
php artisan serve
npm install
npm run dev
php artisan test
```

### Model & Relasi Inti

- `User` — hasMany `Novel` (sebagai translator), hasMany `Ticket` (sebagai target atau pengirim)
- `Novel` — belongsTo `User`, hasMany `Volume`, hasMany `Chapter`, hasMany `NovelAltTitle`, belongsToMany `Genre`, belongsToMany `Tag`, belongsToMany `Creator` (via `novel_author` dan `novel_illustrator` — dua relasi berbeda ke tabel `creators` yang sama)
- `Volume` — belongsTo `Novel`, hasMany `Chapter`
- `Chapter` — belongsTo `Novel`, belongsTo `Volume` (nullable)
- `Creator` — belongsToMany `Novel` (as author atau illustrator)
- `Genre` / `Tag` — belongsToMany `Novel`
- `Favorite` / `ChapterRead` — tidak ada relasi ke `User`, cuma `device_id` string + FK ke `Novel`/`Chapter`
- `Ticket` — belongsTo `User` (nullable, kalau `from_type`/`to_type` = translator/superadmin)

### Route Groups

```php
// routes/web.php
Route::get('/', ...)                                  // public
Route::get('/novels/{slug}', ...)
Route::get('/novels/{slug}/{chapter}', ...)
Route::get('/novels/{slug}/vol-{vol}/{chapter}', ...)
Route::get('/translator/{username}', ...)
Route::post('/favorites', ...);
Route::delete('/favorites/{novel}', ...);
Route::get('/continue-reading', ...);
Route::post('/tickets', ...);                          // reader submit tiket

Route::get('/auth/login', ...);
Route::get('/auth/callback', ...);
Route::post('/auth/logout', ...);

Route::middleware(['auth', 'role:translator'])->prefix('dashboard')->group(function () {
    // novel & chapter CRUD milik translator sendiri, autosave, creators autocomplete
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    // dashboard stats, user role management, moderasi, genre/tag CRUD, tickets
});
```

### Authorization Pattern

```php
class NovelPolicy
{
    public function update(User $user, Novel $novel): bool
    {
        return $user->id === $novel->user_id;
    }
}
```

---

## Frontend (Inertia + React)

### Constraints

- Inertia.js — pakai `<Link>` dan `router` dari `@inertiajs/react`, bukan fetch/axios manual untuk navigasi halaman.
- Shadcn UI sebagai component library.
- TypeScript strict mode.
- Tiptap untuk editor chapter — mirip pengalaman nulis blog, support sisip gambar di tengah teks, autosave berkala (debounced).
- Reader `device_id` di-generate & disimpan di cookie/localStorage saat pertama kali akses, dikirim ke server untuk favorite & chapter_reads — tidak ada UI login untuk reader sama sekali.
- Tidak pakai Redux/Zustand — React state + Inertia shared props untuk data global (current user translator/admin, dsb).

### Struktur Halaman (Pages)

```
resources/js/
  Pages/
    Home.tsx                    # browse novels + filter/search
    Novels/
      Show.tsx                  # novel detail + chapter list (badge on_revision)
      Chapter.tsx                # baca chapter, trigger record chapter_reads
    TranslatorProfile.tsx        # halaman profil publik translator
    Favorites.tsx
    ContinueReading.tsx
    Auth/
      Callback.tsx                # handling state SSO callback (jika perlu UI)
    Dashboard/
      Index.tsx                  # daftar novel milik translator
      Novels/Create.tsx
      Novels/Edit.tsx
      Chapters/Create.tsx
      Chapters/Edit.tsx          # editor Tiptap + autosave indicator
    Admin/
      Index.tsx                  # dashboard statistik
      Users.tsx                  # read-only + tombol grant/revoke role
      Novels.tsx
      Genres.tsx
      Tags.tsx
      Tickets.tsx
  Components/
    NovelCard.tsx
    ChapterEditor.tsx            # wrapper Tiptap + autosave
    FilterBar.tsx
    FavoriteButton.tsx
    CreatorAutocomplete.tsx      # search-as-you-type author/illustrator
```

---

## Do Not

- Do not bangun sistem auth/password lokal — semua login translator & admin lewat SSO PKCE.
- Do not bangun sistem register/login untuk reader — reader sepenuhnya anonim.
- Do not izinkan admin edit nama/email/avatar user secara langsung — itu domain SSO.
- Do not izinkan translator edit/delete novel atau chapter yang bukan miliknya (selalu cek via Policy).
- Do not bangun flow publish-approval — platform terpusat, translator publish langsung.
- Do not simpan file cover image di luar Laravel Filesystem disk yang terkonfigurasi.
- Do not bangun sistem comment/rating/notifikasi di MVP (out of scope).
- Do not bangun fitur upload/edit avatar sebelum ada briefing lanjutan soal avatar SSO.
- Do not tambah Redux, Zustand, atau state management library lain.
- Do not skip tahap 2 logout (redirect ke SSO logout) — akan menyebabkan auto-login.
- Do not tambah `console.log` di production code.

---

## Code Style

- Laravel: PSR-12, type hints di semua method, controller thin — logic di Service/Action class kalau kompleks.
- React: functional components only, TypeScript strict mode, no inline styles (pakai Tailwind via Shadcn).
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`).

---

## Deployment

- Hosting: EC2 / Linux VM.
- Staging domain: scribe.suryatmaja.dev
- Production domain (planned): scribe.whitearchive.id
- First deploy: `make deploy` → `sudo bash scripts/deploy.sh`
- Updates: `make update` → `bash scripts/update.sh` (git pull + migrate + rebuild)
- No CI/CD yet — see [docs/TODO.md](../docs/TODO.md).

---

## TODO

See [docs/TODO.md](../docs/TODO.md).
