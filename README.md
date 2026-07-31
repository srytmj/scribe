# Scribe

CMS publishing light novel — salah satu project di bawah payung White Archive. Dibuat untuk freelance translator yang perlu publish terjemahan secara terstruktur (novel → volume → chapter) tanpa infrastruktur sendiri, dan reader yang mau baca banyak karya dari berbagai translator di satu tempat — tanpa perlu daftar akun.

---

## Fitur Utama

- **Katalog & baca tanpa login** — reader browse katalog (filter genre/tag/status, search judul), baca chapter, favorite, dan continue reading — semua tanpa akun, tracking berbasis device
- **Novel & chapter management** — translator CRUD novel (judul + judul alternatif multi-bahasa, cover, author/illustrator via autocomplete, genre/tag), CRUD volume (opsional), tulis chapter dengan editor blog-style (Tiptap, sisip gambar) + autosave
- **Status chapter 3 tingkat** — draft (privat), on_revision (badge, tidak bisa dibuka reader), published (langsung tampil, tanpa approval admin)
- **Import metadata dari AniList** — cari & import judul, sinopsis, genre, author, skor light novel (media type `NOVEL`) langsung dari [AniList GraphQL](https://anilist.co)
- **Global search / Command Palette** — reader cari katalog lewat ⌘K/Ctrl+K, translator/admin navigasi cepat + search Novel/Users/Tiket
- **Sistem tiket** — translator request bug/fitur ke admin; reader (anonim) bisa request ke admin atau translator tertentu
- **Menu Management** — admin kontrol visibility & maintenance mode per menu translator/admin
- **Announcements** — pengumuman dari admin ke translator/admin
- **Dashboard dengan chart** — statistik novel/chapter/tiket (Recharts)
- **Undo pada toast** — aksi reversible (unfavorite, mark-as-read) bisa di-undo langsung dari notifikasi
- **Login SSO** — translator & admin autentikasi PKCE OAuth2 via whitearchive.id, tidak ada akun lokal terpisah
- **Storage fleksibel** — konfigurasi Local disk atau S3-compatible (Cloudflare R2, dll) langsung dari UI admin, tanpa edit `.env`
- **Backup & restore database** — download/import dump SQL dari UI admin (admin only)
- **Role-based access** — `admin` > `translator` > `pending`, dikontrol lewat Spatie Permission + menu management berbasis database
- **Mobile-first** — semua halaman reader responsive dari layar 375px ke atas

Detail lengkap tiap fitur ada di [`CLAUDE.md`](CLAUDE.md) bagian "Fitur yang Sudah Ada".

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12 |
| Frontend bridge | Inertia.js v2 |
| Frontend UI | React 19 + TypeScript 5 |
| Komponen UI | shadcn/ui (Base UI) |
| Styling | Tailwind CSS v4 |
| Bundler | Vite |
| Database | SQLite (dev) / MySQL 8+ (prod) |
| Auth/Role | Spatie Laravel Permission — translator & admin saja |
| Auth SSO | whitearchive.id (PKCE OAuth2) |
| External API | AniList GraphQL |

Reader **tidak** menyentuh SSO/Spatie Permission sama sekali — sepenuhnya anonim, tracking via `device_id` cookie.

Detail arsitektur lengkap: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Struktur Role

```
admin > translator > pending
```

`pending` = user yang baru login SSO, menunggu di-grant translator oleh admin. Reader tidak punya role — tidak login.

Akses translator/admin dikontrol dua lapis: Spatie Role (resource level) + `CheckMenuAccess` middleware (route level).

---

## Setup Lokal (Development)

Prasyarat: PHP 8.2+, Composer, Node.js 20+, npm.

```bash
git clone <repo-url> scribe
cd scribe
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm run dev
```

Jalankan server Laravel di terminal terpisah:

```bash
php artisan serve
```

Buka `http://localhost:8000`.

### Login SSO saat development

Daftarkan aplikasi di `sso.whitearchive.id/dashboard/applications` untuk dapat `SSO_CLIENT_ID` dan `SSO_CLIENT_SECRET`, lalu isi di `.env`:

```env
SSO_CLIENT_ID=
SSO_CLIENT_SECRET=
SSO_REDIRECT_URI=http://localhost:8000/auth/callback
SSO_BASE_URL=https://sso.whitearchive.id
```

### Storage saat development

Default driver `local` langsung jalan tanpa konfigurasi tambahan. Untuk switch ke S3-compatible (Cloudflare R2, dll), buka `/admin/settings/storage` setelah login sebagai `admin` — tidak perlu edit `.env`.

---

## Testing

```bash
php artisan test
npx tsc --noEmit
```

---

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [`CLAUDE.md`](CLAUDE.md) | Aturan coding, struktur folder, konvensi wajib |
| [`AGENT.md`](AGENT.md) | Konteks project untuk agent — baca sebelum task apapun |
| [`QA.md`](QA.md) | Instruksi QA chat (trigger: `cek`) |
| [`docs/prd.md`](docs/prd.md) | Product requirements — persona, fitur, access matrix |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Skema database, folder structure, request lifecycle |
| [`docs/FLOWS.md`](docs/FLOWS.md) | Navigation map + user flows (termasuk SSO sequence) |
| [`docs/PHASES.md`](docs/PHASES.md) | Breakdown fase pengembangan + checklist |
| [`CHANGELOG.md`](CHANGELOG.md) | Histori perubahan penting per tanggal |

## Lisensi

MIT
