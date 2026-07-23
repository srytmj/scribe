# Scribe

Platform CMS publishing light novel terpusat untuk freelance translator dan reader.

**Reader tanpa login** — browse dan baca langsung, tracking favorite & progress baca berbasis device (bukan akun). **Translator & admin login via SSO whitearchive.id.** Tidak ada subdomain per translator — semua karya tampil di satu katalog.

## Docs

| Document | Description |
|----------|-------------|
| [docs/PRD.md](docs/PRD.md) | Product Requirements — problem, user stories, features, success metrics |
| [docs/SRS.md](docs/SRS.md) | Software Requirements — tech stack, schema, SSO integration, route structure |
| [docs/STRUCTURE.md](docs/STRUCTURE.md) | Full file structure with explanation of every folder and file |
| [docs/FLOW.md](docs/FLOW.md) | User flow & SSO auth sequence (Mermaid flowchart) |
| [docs/TODO.md](docs/TODO.md) | Planned work and known gaps |
| [SESSION-PROMPTS.md](SESSION-PROMPTS.md) | Copy-paste prompts for PM / DEV / QA Claude Code sessions |

---

## Roles

| Role | Login | Deskripsi |
|------|-------|-----------|
| Reader | Tidak perlu | Browse, baca, favorite, continue reading — semua device-based, tanpa akun. |
| Translator | SSO whitearchive.id | Di-grant admin (default `pending` setelah login pertama). Manage novel & chapter miliknya. |
| Admin | SSO whitearchive.id (`superadmin`) | Full access: statistik, role management, moderasi, taxonomy, tiket. |

---

## Features

- **Reader anonim** — browse (filter genre/tag/search), baca chapter, favorite, continue reading + indikator baca/belum, semua tanpa akun (device-based)
- **Translator dashboard** — CRUD novel (judul original + judul alternatif multi-bahasa, cover, author/illustrator via autocomplete, genre/tag), CRUD volume (opsional), CRUD chapter dengan editor blog-style (Tiptap, sisip gambar) + autosave
- **Status chapter 3 tingkat** — draft (privat), on_revision (tampil dengan badge, tidak bisa dibuka), published (langsung tampil, tanpa approval admin)
- **Admin panel** — dashboard statistik, lihat user (read-only, data dari SSO) + grant/revoke role translator, moderasi konten, CRUD genre/tag, kelola tiket
- **Ticketing** — translator → superadmin (bug/feature request), reader → superadmin atau translator tertentu

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | Laravel 11 + Inertia.js |
| Database | PostgreSQL |
| Frontend | React (via Inertia) |
| UI | Shadcn UI |
| Editor | Tiptap |
| Auth | SSO whitearchive.id (OAuth2 Authorization Code + PKCE) |
| Storage | Local disk (MVP) → S3/R2 (later) |
| Hosting | EC2 / any Linux VM |

---

## Project Structure

```
scribe/
  backend/                  # Laravel 11 + Inertia.js (monolith)
    app/
      Http/Controllers/     # Novel, Chapter, Volume, Favorite, Reading, Ticket, Auth/Sso, Admin/*
      Models/                # User, Novel, NovelAltTitle, Volume, Chapter, Creator, Genre, Tag,
                              # Favorite, ChapterRead, Ticket
      Policies/              # NovelPolicy, ChapterPolicy
      Services/Sso/          # SsoClient (OAuth2 PKCE wrapper)
    resources/js/
      Pages/                 # Home, Novels/Show, Novels/Chapter, Dashboard/*, Admin/*
      Components/            # NovelCard, ChapterEditor (Tiptap), CreatorAutocomplete, FavoriteButton
    routes/web.php
    database/migrations/
  scripts/
    deploy.sh                # First-time deploy wizard
    update.sh                # Pull latest + migrate + rebuild + redeploy
  docs/
    PRD.md
    SRS.md
    STRUCTURE.md
    FLOW.md
    TODO.md
    tickets/                 # TASK-XXX.md per feature ticket
      bugs/                  # BUG-XXX.md per bug ticket
  .claude/
    CLAUDE.md                 # Project instructions for Claude Code
    agents/                   # PM.md, DEV.md, QA.md session personas
  Makefile                    # make sync / make update / make deploy
  sync.sh                     # Sync stack from SRS into .claude/CLAUDE.md
  SESSION-PROMPTS.md
```

---

## Local Development

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL

### Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Set di `backend/.env`:
```env
APP_URL=http://localhost:8000
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=scribe
DB_USERNAME=postgres
DB_PASSWORD=

SSO_CLIENT_ID=xxx
SSO_CLIENT_SECRET=xxx
SSO_REDIRECT_URI=http://localhost:8000/auth/callback
SSO_BASE_URL=https://sso.whitearchive.id
```

```bash
php artisan migrate
npm install
npm run dev          # Vite dev server (HMR untuk React)
php artisan serve    # → http://localhost:8000
```

---

## Deployment

- Hosting: EC2 / Linux VM
- Staging: `scribe.suryatmaja.dev`
- Production (planned): `scribe.whitearchive.id`
- First deploy: `make deploy` → `sudo bash scripts/deploy.sh`
- Update: `make update` → `bash scripts/update.sh` (git pull + migrate + rebuild)

---

## Security

- Auth sepenuhnya via SSO (OAuth2 + PKCE) — tidak ada password lokal, tidak ada register form
- Logout wajib 2 tahap: clear session lokal + redirect SSO logout
- Authorization via Laravel Policy — translator hanya bisa modifikasi konten miliknya
- Admin tidak bisa edit profil user (nama/email/avatar) — murni domain SSO, admin cuma atur role lokal
- Reader tracking (favorite, reading progress) anonim berbasis `device_id`, tidak terikat identitas apapun
- Rate-limit submission tiket dari reader anonim untuk cegah spam

---

## TODO

See [docs/TODO.md](docs/TODO.md) for planned work and known gaps.
