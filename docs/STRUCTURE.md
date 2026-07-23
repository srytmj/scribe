# Project Structure

Penjelasan lengkap setiap folder dan file dalam project ini.

```
scribe/
├── docs/                              # Dokumentasi proyek
│   ├── PRD.md                         # Product Requirements Document
│   ├── SRS.md                         # Software Requirements Specification
│   ├── TODO.md                        # Daftar pekerjaan yang belum selesai
│   ├── STRUCTURE.md                   # File ini
│   └── tickets/                       # TASK-XXX.md dan bugs/BUG-XXX.md
│
├── backend/                           # Laravel 11 + Inertia.js (serve React, monolith)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/
│   │   │   │   │   └── SsoController.php        # login redirect, callback, 2-stage logout
│   │   │   │   ├── NovelController.php          # Browse, detail, CRUD (dashboard)
│   │   │   │   ├── ChapterController.php        # Read, CRUD, autosave (dashboard)
│   │   │   │   ├── VolumeController.php         # CRUD volume
│   │   │   │   ├── CreatorController.php        # Autocomplete author/illustrator
│   │   │   │   ├── FavoriteController.php       # Favorite/unfavorite (device-based)
│   │   │   │   ├── ReadingController.php        # Record chapter_reads, continue reading
│   │   │   │   ├── TicketController.php         # Submit tiket (translator & reader)
│   │   │   │   ├── TranslatorProfileController.php # Halaman profil publik translator
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── DashboardController.php  # Statistik platform
│   │   │   │   │   ├── UserController.php       # Read-only user list + grant/revoke role
│   │   │   │   │   ├── NovelController.php      # Moderasi novel
│   │   │   │   │   ├── ChapterController.php    # Moderasi chapter
│   │   │   │   │   ├── GenreController.php      # CRUD genre
│   │   │   │   │   ├── TagController.php        # CRUD tag
│   │   │   │   │   └── TicketController.php     # Kelola tiket masuk
│   │   │   └── Requests/                         # Form request validation per resource
│   │   ├── Models/
│   │   │   ├── User.php                          # sso_id, role lokal, sso_role
│   │   │   ├── Novel.php
│   │   │   ├── NovelAltTitle.php
│   │   │   ├── Volume.php
│   │   │   ├── Chapter.php
│   │   │   ├── Creator.php                       # author & illustrator (shared entity)
│   │   │   ├── Genre.php
│   │   │   ├── Tag.php
│   │   │   ├── Favorite.php                      # device-based, no user relation
│   │   │   ├── ChapterRead.php                   # device-based, no user relation
│   │   │   └── Ticket.php
│   │   ├── Services/
│   │   │   └── Sso/
│   │   │       └── SsoClient.php                 # wrapper OAuth2 PKCE flow ke sso.whitearchive.id
│   │   ├── Policies/
│   │   │   ├── NovelPolicy.php                   # Translator hanya edit novel miliknya
│   │   │   └── ChapterPolicy.php                  # Translator hanya edit chapter miliknya
│   │   └── Providers/
│   │       └── AppServiceProvider.php
│   │
│   ├── database/
│   │   └── migrations/                            # users (+ sso fields), novels, novel_alt_titles,
│   │                                               # creators, novel_author, novel_illustrator,
│   │                                               # volumes, chapters, genres, tags, pivot tables,
│   │                                               # favorites, chapter_reads, tickets
│   │
│   ├── resources/
│   │   ├── js/
│   │   │   ├── Pages/                             # Halaman Inertia (lihat CLAUDE.md)
│   │   │   ├── Components/                        # NovelCard, ChapterEditor (Tiptap), CreatorAutocomplete, dll
│   │   │   └── app.tsx                            # Entry point Inertia + React
│   │   └── css/
│   │       └── app.css                            # Tailwind + Shadcn base styles
│   │
│   ├── routes/
│   │   └── web.php                                # Semua route (public, auth SSO, dashboard, admin)
│   │
│   ├── storage/
│   │   └── app/public/covers/                     # Cover image novel (local disk MVP)
│   │
│   ├── .env                                       # Environment lokal (tidak di-commit) — termasuk SSO_*
│   ├── .env.example
│   ├── artisan
│   ├── composer.json
│   └── package.json                               # Vite + React + Inertia + Shadcn + Tiptap deps
│
├── scripts/
│   ├── deploy.sh                      # Wizard deploy pertama kali ke EC2
│   └── update.sh                      # Pull GitHub terbaru + migrate + rebuild + redeploy
│
├── Makefile                           # make deploy / make update
├── README.md                          # Dokumentasi utama
└── .claude/
    └── CLAUDE.md                      # Instruksi untuk Claude Code
```

---

## Alur Request

```
Browser (reader, anonim — device_id di cookie)
  │
  ├─► GET  /                    → NovelController@index    (Inertia::render('Home'))
  ├─► GET  /novels/{slug}       → NovelController@show      (Inertia::render('Novels/Show'))
  ├─► GET  /novels/{slug}/{ch}  → ChapterController@show    (record ChapterRead via device_id)
  ├─► POST /favorites           → FavoriteController@store  (upsert by device_id + novel_id)
  │
Browser (translator/admin — session dari SSO)
  ├─► GET  /auth/login          → SsoController@redirect    (PKCE challenge + state → SSO authorize)
  ├─► GET  /auth/callback       → SsoController@callback    (tukar code, sync profile, buat session)
  │
  ├─► POST /dashboard/novels    → NovelController@store     (NovelPolicy::create, role:translator)
  ├─► PUT  /dashboard/novels/{id} → NovelController@update  (NovelPolicy::update — cek owner)
  ├─► PATCH /dashboard/.../chapters/{id}/autosave → ChapterController@autosave
  │
  └─► PUT  /admin/users/{id}/role → Admin\UserController@updateRole (role:admin middleware, hanya ubah role lokal)
```

Inertia me-render React component langsung dari response Laravel — tidak ada REST API layer terpisah untuk halaman utama.

---

## Environment Variables

### backend/.env

| Key | Contoh | Keterangan |
|-----|--------|------------|
| `APP_ENV` | `production` | Mode Laravel |
| `APP_KEY` | `base64:...` | Generate via `artisan key:generate` |
| `APP_URL` | `https://scribe.suryatmaja.dev` | URL aplikasi |
| `DB_CONNECTION` | `pgsql` | PostgreSQL |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | — | Kredensial PostgreSQL |
| `FILESYSTEM_DISK` | `public` | Disk lokal untuk cover image (MVP) |
| `SSO_CLIENT_ID` | `xxx` | Client ID dari sso.whitearchive.id |
| `SSO_CLIENT_SECRET` | `xxx` | Client secret (jangan pernah expose ke frontend) |
| `SSO_REDIRECT_URI` | `https://scribe.suryatmaja.dev/auth/callback` | Callback URL terdaftar di SSO |
| `SSO_BASE_URL` | `https://sso.whitearchive.id` | Base URL identity provider |

---

## Catatan Migrasi dari Iterasi Sebelumnya

Repo ini sudah melewati 2 pivot:
1. File-to-markdown converter (API Laravel + frontend Vite terpisah, no DB) → digantikan total.
2. Light novel CMS dengan reader login lokal & translator self-register-lalu-di-promote → digantikan oleh model saat ini: **platform terpusat, auth translator/admin via SSO whitearchive.id, reader sepenuhnya anonim device-based, tanpa publish-approval flow.**

Struktur di atas adalah versi final MVP yang berlaku sekarang.
