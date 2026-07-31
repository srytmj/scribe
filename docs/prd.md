# PRD — Scribe (Light Novel Publishing CMS)

**Versi:** 1.0
**Tanggal:** 2026-07-26
**Status:** Active

---

## 1. Latar Belakang

Freelance translator light novel butuh platform terpusat untuk publish hasil terjemahan tanpa perlu infrastruktur sendiri. Reader butuh satu tempat untuk browse dan baca karya dari banyak translator sekaligus, tanpa friksi pendaftaran akun.

Scribe adalah salah satu project di bawah payung White Archive (bukan platform utama White Archive — root domain `whitearchive.id` adalah landing page ekosistem, di luar scope project ini). Scribe hidup di `scribe.whitearchive.id`.

Arsitektur & konvensi teknis Scribe mengikuti pola project sister **MALAS** (manga library admin system) — Laravel 12 + Inertia v2 + React 19 + shadcn/ui (Base UI), auth SSO whitearchive.id, storage configurable via UI, menu management, tiket, dsb. Fitur inti berbeda karena tujuan project berbeda.

---

## 2. User Personas

### Translator
> "Aku mau publish terjemahanku dengan cepat, rapi, dan gak perlu setup infrastruktur sendiri."

- Role: `translator` (di-grant admin, tidak self-register)
- Login via SSO whitearchive.id
- Goal: input novel & chapter cepat, autosave anti-kehilangan progress, kontrol status draft/revisi/publish

### Reader
> "Aku mau baca light novel tanpa ribet daftar akun apapun."

- Tidak ada role — sepenuhnya anonim
- Goal: browse katalog dari banyak translator, baca, lanjut baca dari chapter terakhir, favorite

### Admin
> "Aku mau platform ini jalan bersih — translator yang aktif ke-grant, konten yang melanggar ke-moderasi."

- Role: `admin`, login via SSO whitearchive.id dengan role SSO `superadmin`
- Goal: kontrol akses translator, moderasi, statistik platform

---

## 3. Roles

| Role | Deskripsi |
|------|-----------|
| `admin` | Akses penuh: role management, moderasi, menu, storage, backup, announcements, tiket. |
| `translator` | Manage novel & chapter miliknya sendiri. Didapat lewat grant admin. |
| `pending` | Login SSO pertama kali, menunggu grant admin — tidak ada akses `/dashboard`. |
| Reader (anonim) | Tidak ada akun. Browse, baca, favorite, continue reading — device-based. |

---

## 4. Fitur

### F-01 — Autentikasi (Translator & Admin)
- Login via SSO whitearchive.id (PKCE OAuth2) — tidak ada form register/login lokal
- Role SSO (`user`/`superadmin`) dipetakan ke role lokal Scribe: `superadmin` → `admin`; `user` (login pertama) → `pending`, menunggu grant admin jadi `translator`
- Profil ditampilkan read-only di `/settings` (edit profil di sisi SSO)
- Logout wajib 2 tahap: hapus session lokal, lalu redirect ke SSO logout — skip tahap ini menyebabkan auto-login

### F-02 — Reader (Tanpa Akun)
- Tidak ada login/register untuk reader dalam bentuk apapun
- Identitas reader = `device_id` (cookie httpOnly), digenerate otomatis di kunjungan pertama
- Semua data reader (favorite, chapter_reads) di-key oleh `device_id`, tidak pernah terikat ke tabel `users`

### F-03 — Menu Management *(Admin)*

Sama seperti MALAS — admin mengontrol menu translator/admin:

| Field | Tipe | Keterangan |
|-------|------|-----------|
| `label` | string | Nama tampil di sidebar |
| `route_name` | string | Laravel route name |
| `icon` | string | Nama icon Lucide |
| `sort_order` | int | Urutan di sidebar |
| `is_visible` | bool | Tampil/tidak |
| `is_maintenance` | bool | Mode maintenance aktif/tidak |
| `maintenance_message` | text | Pesan custom |
| `role_access` | json array | `["translator","admin"]` |

Reader tidak terpengaruh menu system (tidak ada sidebar di sisi reader).

### F-04 — Katalog Novel *(Translator CRUD milik sendiri / Admin moderasi semua / Reader read-only)*

| Field | Keterangan |
|-------|-----------|
| `title` | judul original, required |
| judul alternatif | tabel terpisah (`novel_alt_titles`), bisa banyak bahasa (Indonesia, English, dst) |
| `status` | `draft` / `ongoing` / `completed` / `hiatus` / `dropped` |
| `cover_path` | upload manual atau import dari AniList — via `StorageSettingsService` |
| `synopsis` | text, nullable |
| `origin_language` / `translation_language` | string |
| `author` / `illustrator` | entity `creators` (bukan free text), autocomplete + create-if-not-exist |
| `genres` / `tags` | tabel master dikelola admin, translator attach/detach ke novel |
| `anilist_id` | unique, nullable — hasil import AniList |
| `is_mature` | boolean — dipakai untuk blur konten mature (opt-in per instalasi, tab Konten di Pengaturan) |

Reader akses:
- Browse list + filter (status, genre, tag, search judul) — lintas semua translator, tanpa login
- Lihat detail: sinopsis, alt titles, author/illustrator, genre/tag, daftar chapter per volume
- Chapter `on_revision` tampil dengan badge, tidak bisa diklik; `draft` tidak tampil sama sekali
- Cari cepat lewat Global Search (⌘K)

### F-05 — Volume & Chapter *(Translator CRUD milik sendiri)*

| Field | Keterangan |
|-------|-----------|
| `volume.number` / `volume.title` | opsional — chapter boleh tidak punya volume |
| `chapter.chapter_number` | decimal(8,1), support 1.5 untuk side story/interlude |
| `chapter.title` | nullable |
| `chapter.content` | Tiptap, support sisip gambar inline |
| `chapter.status` | `draft` / `on_revision` / `published` |
| autosave | konten ke-save otomatis berkala saat translator mengetik (`last_autosaved_at`) |

Tidak ada publish-approval flow — translator publish langsung begitu status diubah jadi `published`.

### F-06 — Favorite & Continue Reading *(Reader, device-based)*

Analog "Koleksi" di MALAS, tapi jauh lebih sederhana karena reader anonim — tidak ada rating/review pribadi (out of scope, konsisten dengan keputusan awal MVP).

| Tabel | Keterangan |
|-------|-----------|
| `favorites` | `device_id` + `novel_id`, UNIQUE per pasangan |
| `chapter_reads` | `device_id` + `chapter_id` + `read_at`, upsert tiap baca — sumber continue reading & indikator baca/belum |

### F-07 — AniList API Integration *(Translator/Admin)*

- Cari light novel (media type `NOVEL`) di AniList via GraphQL
- Preview data sebelum import (card overlay)
- Import isi field: judul, sinopsis, genre, author (jika tersedia), cover, skor AniList (informational, bukan rating reader)
- Sync ulang metadata ke novel yang sudah ada (Popover "Sync AniList" di halaman Edit Novel)

### F-08 — Announcements *(Translator & Admin — bukan reader)*

- Admin buat: title, body (markdown), type (info/warning/danger/success), aktif, tanggal mulai-selesai
- Translator/admin: lihat di dashboard, bisa dismiss per pengumuman
- Tidak tampil ke reader — reader tidak punya akun untuk tracking dismiss per-user

### F-09 — User Management *(Admin)*

- List, view profil (read-only, data dari SSO), grant/revoke role `translator`, ban/unban
- Admin tidak bisa upgrade user ke/dari `admin` lewat halaman ini (role admin di-set manual/seed, konsisten dengan mapping SSO `superadmin`)
- Reset password tidak berlaku — password dikelola SSO

### F-10 — Dashboard

**Admin:** stat cards + chart (Recharts): Novel per Status, Chapter per Status, Tiket per Status
**Translator:** stat cards (jumlah novel, chapter published/draft), chart Chapter per Status miliknya sendiri

### F-11 — Global Search & Command Palette

- **Reader side (tanpa login):** search bar di header (desktop)/icon search (mobile), atau ⌘K — cari judul novel di katalog, atau navigasi cepat (Beranda, Favorit, Continue Reading)
- **Translator/Admin side:** Command Palette (⌘K) — navigasi cepat + search Novel/Users/Tiket

### F-12 — Storage & Database Backup *(Admin only)*

- Konfigurasi driver storage (`local`/`s3`-compatible) dari UI admin, bukan `.env`
- Semua operasi file (cover novel, gambar inline chapter) lewat `StorageSettingsService`
- Download/import dump SQL database dari UI

### F-13 — Sistem Tiket

- Translator buat tiket (bug/feature request) ke admin
- Reader (anonim, device-based) buat tiket ke admin atau translator tertentu (mis. request chapter)
- Admin/translator merespon dari halaman detail tiket
- Status: `open`, `in_progress`, `resolved`, `closed`
- Rate-limit submission dari reader anonim untuk cegah spam

### F-14 — Undo pada Aksi Reversible

- Toast (sonner) menampilkan tombol "Undo" untuk aksi reversible, dari flash session (`undo_url` + `undo_payload`)
- Contoh: unfavorite, mark chapter as read

---

## 5. Access Matrix

| Fitur | admin | translator | reader (anonim) |
|-------|:-----:|:----------:|:----------------:|
| Dashboard | ✓ | ✓ | — |
| Menu Management | ✓ | — | — |
| User Management (grant/ban) | ✓ | — | — |
| Novel: lihat (published, semua translator) | ✓ | ✓ | ✓ |
| Novel: CRUD milik sendiri | ✓ (semua) | ✓ (miliknya) | — |
| Novel: moderasi/delete lintas translator | ✓ | — | — |
| Chapter: CRUD milik sendiri | ✓ (semua) | ✓ (miliknya) | — |
| Chapter: baca (published) | — | — | ✓ |
| AniList Import | ✓ | ✓ | — |
| Favorite / Continue Reading | — | — | ✓ (device) |
| Announcements: CRUD | ✓ | — | — |
| Announcements: lihat | ✓ | ✓ | — |
| Tiket: respond | ✓ | — | — |
| Tiket: buat & lihat milik sendiri | ✓ | ✓ | ✓ (device) |
| Log Aktivitas | ✓ | — | — |
| Storage & Database Backup | ✓ | — | — |
| Global Search / Command Palette | ✓ | ✓ | ✓ |

---

## 6. Out of Scope

- Aplikasi mobile native
- Marketplace / jual beli / monetisasi internal (hanya link eksternal Trakteer/Tako di profil translator)
- Comment & rating system
- Notifikasi (email/push)
- RSS feed
- Loans/peminjaman — tidak relevan, Scribe bukan platform pinjam fisik/digital
- Akun/login untuk reader dalam bentuk apapun
- Subdomain per translator
- Profil publik translator + sistem follow + activity feed — ditunda, lihat backlog di `docs/PHASES.md`
