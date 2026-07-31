# Scribe — Claude Code Rules

## Meta Rules (BACA DULU SEBELUM APAPUN)

| Sinyal | Artinya |
|--------|---------|
| Pesan diakhiri **"gimana?"** | Ini diskusi. **Jangan sentuh kode.** Bahas rencana dulu. |
| User menulis **"lanjut" / "gas" / "oke"** | Baru boleh mulai implementasi. |
| Selesai 1 fase | Ingatkan user untuk buka QA chat (`lihat QA.md`). |

Untuk setiap rencana perubahan yang belum dapat konfirmasi → **tulis rencananya dulu, tunggu "gas".**

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12 |
| Frontend bridge | Inertia.js v2 |
| Frontend UI | React 19 + TypeScript 5 |
| Komponen UI | shadcn/ui (copy-paste via Base UI — gunakan `render` prop, bukan `asChild`) |
| Styling | Tailwind CSS v4 |
| Bundler | Vite |
| Database (dev) | SQLite |
| Database (prod) | MySQL 8+ |
| Auth/Role | Spatie Laravel Permission |
| File storage | Local (dev) atau S3-compatible/Cloudflare R2 (prod) — dikonfigurasi via UI admin, bukan `.env` |
| External API | AniList GraphQL (`https://graphql.anilist.co`) — untuk import metadata light novel (kategori `NOVEL` di AniList) |
| Auth SSO | whitearchive.id — PKCE-based OAuth2, translator & admin login lewat SSO |

**Reader TIDAK login sama sekali** — sepenuhnya anonim, tracking berbasis `device_id` (cookie). Ini beda fundamental dari MALAS (yang mengharuskan semua role, termasuk `user`, login SSO).

---

## Struktur Folder

```
app/
  Http/
    Controllers/
      Admin/
        DashboardController.php
        MenuController.php
        NovelController.php          — bulk delete, moderasi semua novel (bukan cuma admin sendiri)
        AniListController.php        — search & import dari AniList GraphQL
        UserController.php           — lihat user (read-only dari SSO) + grant/revoke role + ban
        AnnouncementController.php
        TicketController.php         — admin/superadmin respond tiket
        StorageSettingController.php
        DatabaseBackupController.php
        ActivityLogController.php
        SiteSettingController.php    — blur konten mature
        CommandSearchController.php  — search Novel/Users/Tickets untuk Command Palette (⌘K)
      Translator/
        NovelController.php          — CRUD novel milik sendiri
        VolumeController.php
        ChapterController.php        — CRUD + autosave + status draft/on_revision/published
        CreatorController.php        — autocomplete author/illustrator
        TicketController.php         — translator buat & lihat tiket ke superadmin
      Public/
        HomeController.php           — katalog reader, filter/search, tanpa login
        NovelController.php          — detail novel
        ChapterController.php        — baca chapter, record chapter_reads
        FavoriteController.php       — device-based
        ContinueReadingController.php
        TicketController.php         — reader submit tiket (device-based)
        SearchController.php         — Global Search reader (⌘K), tanpa login
      Auth/
        SsoController.php            — PKCE OAuth2 redirect/callback/logout
    Middleware/
      CheckMenuAccess.php
      EnsureNotBanned.php
      EnsureDeviceId.php             — assign device_id cookie untuk reader anonim
  Models/
    User.php
    Novel.php                        — anilist_id, genres/authors via relasi (bukan json — lihat catatan di ARCHITECTURE.md)
    NovelAltTitle.php
    Volume.php
    Chapter.php
    Creator.php
    Genre.php / Tag.php
    Favorite.php                     — device-based, tanpa relasi ke User
    ChapterRead.php                  — device-based
    Ticket.php
    Menu.php
    Announcement.php
    StorageSetting.php               — encrypted secret_access_key cast
    ActivityLog.php
    SiteSetting.php                  — blur_mature_content, single-row
  Policies/
    NovelPolicy.php / ChapterPolicy.php / VolumePolicy.php
    TicketPolicy.php / AnnouncementPolicy.php / MenuPolicy.php / UserPolicy.php / StorageSettingPolicy.php
  Services/
    AniListService.php               — GraphQL client, filter media type NOVEL
    StorageSettingsService.php       — satu pintu untuk semua operasi file storage

resources/js/
  Pages/
    Admin/
      Dashboard.tsx     — stat cards + chart: Novel per Status, Chapter per Status, Tiket per Status
      Menus/            Index.tsx, Edit.tsx
      Novels/           Index.tsx (bulk delete, moderasi lintas translator)
      Users/            Index.tsx, Show.tsx (grant/revoke role, ban)
      Announcements/    Index.tsx, Create.tsx, Edit.tsx
      AniList/          Index.tsx, Status.tsx
      Tickets/          Index.tsx, Show.tsx
      ActivityLog/      Index.tsx
      Settings/         Index.tsx (tab Storage/Database/Konten)
    Translator/
      Dashboard.tsx     — daftar novel milik sendiri + stat ringkas
      Novels/           Index.tsx, Create.tsx, Edit.tsx (termasuk kelola volume inline, alt titles, creators, genre/tag)
      Chapters/         Create.tsx, Edit.tsx (editor Tiptap + autosave indicator)
      Tickets/          Index.tsx, Create.tsx, Show.tsx
    Public/
      Home.tsx          — katalog reader, filter genre/tag/status, search
      Novels/
        Show.tsx        — detail novel, chapter list per volume, badge on_revision
        Chapter.tsx     — baca chapter
      Favorites.tsx
      ContinueReading.tsx
      Tickets/Create.tsx — reader submit tiket (opsional pilih translator tujuan)
    Auth/
      Banned.tsx
    Settings/
      Index.tsx         — profil translator/admin, read-only dari SSO
    Error.tsx
    Maintenance.tsx
    Landing.tsx          — landing publik reader (redirect dari `/`)
  Layouts/
    AdminLayout.tsx      — sidebar + topbar admin, mount CommandPalette
    TranslatorLayout.tsx — sidebar + topbar translator, mount CommandPalette
    PublicLayout.tsx     — layout ringan reader, search bar header, mount GlobalSearch
  Components/
    ui/                  — shadcn/ui (JANGAN MODIFIKASI)
    app/
      PageHeader.tsx
      Pagination.tsx
      EmptyState.tsx
      StatusBadge.tsx          — NovelStatusBadge, ChapterStatusBadge, TicketStatusBadge, TicketTypeBadge
      NovelCard.tsx            — poster card katalog
      FilterBar.tsx
      FavoriteButton.tsx
      ChapterEditor.tsx        — wrapper Tiptap + autosave
      CreatorAutocomplete.tsx
      AnnouncementBanner.tsx
      CommandPalette.tsx       — ⌘K translator/admin
      GlobalSearch.tsx         — ⌘K reader (tanpa login)
  hooks/
    useFlash.ts          — sonner toast dari flash session, dukung "Undo"
  lib/
    utils.ts
    types.ts
```

---

## Aturan Coding

### TypeScript
- **Tidak boleh ada `any`** — gunakan `unknown` + type guard jika terpaksa.
- Semua Inertia page props harus punya interface eksplisit.
- Semua komponen harus punya typed props.
- Gunakan `type` untuk object shapes, `interface` untuk yang bisa di-extend.

### React Components
- Semua komponen UI wajib pakai **shadcn/ui** — jangan buat custom dari nol.
- shadcn/ui di project ini berbasis **Base UI** — gunakan `render` prop bukan `asChild`.
- Form pakai **React Hook Form** + **Zod**.
- Tidak ada inline style — semua pakai Tailwind utility class.
- File komponen: `PascalCase.tsx`. File hooks/utils: `camelCase.ts`.
- Mobile-first: `flex-col sm:flex-row`, `flex-wrap` untuk action buttons, `min-h-0` pada flex children yang scroll. Reader-facing pages (katalog, detail novel, baca chapter) prioritas utama mobile karena paling sering diakses dari HP.

### Inertia Controller
- Setiap controller method return `Inertia::render()` atau `redirect()`.
- Route translator/admin pakai `Route::middleware(['auth', 'not_banned', 'check.menu'])`. Route reader publik tidak pakai `auth` sama sekali, cukup `EnsureDeviceId`.
- Data yang dikirim ke frontend harus minimal (jangan kirim seluruh model — terutama jangan kirim `access_token`/`refresh_token` user).

### Laravel Backend
- Semua query pakai **Eloquent** — raw SQL hanya jika tidak bisa dihindari, dengan komentar alasannya.
- Semua model punya `$fillable` eksplisit (tidak pakai `$guarded = []`).
- Semua action yang mengubah data harus lewat **Policy** dulu (kecuali translator terhadap resource miliknya sendiri via ownership check, dan fitur super_admin-only tanpa model relevan).
- Validasi di **FormRequest**, bukan di controller langsung.
- **Semua operasi file storage** (cover novel, gambar inline chapter) harus lewat `StorageSettingsService`, bukan `Storage::` facade langsung.

---

## Sistem Storage

Storage dikonfigurasi **via UI admin** (`/admin/settings/storage`), bukan `.env`. Data tersimpan di tabel `storage_settings` dengan `secret_access_key` ter-encrypt.

```php
// BENAR
public function __construct(private StorageSettingsService $storage) {}
$url = $this->storage->url($novel->cover_path);
$path = $this->storage->storeUploadedFile($file, 'covers');
$this->storage->delete($novel->cover_path);

// SALAH
Storage::disk('public')->url($path);
```

---

## Sistem Otorisasi

```
Role (translator/admin, via SSO): admin > translator > pending

Reader: tidak punya role sama sekali (tidak login).

Akses translator/admin dikontrol oleh:
1. Spatie Role       — resource-level access (via Policy)
2. MenuMiddleware    — route-level access (is_maintenance, role_access)
```

`pending` = user yang baru login SSO tapi belum di-grant akses translator oleh admin — tidak bisa akses `/dashboard` sama sekali (beda dari MALAS yang role `user`-nya langsung punya akses fungsional).

**Jangan pernah hardcode role check di component React.** Kirim permission dari backend, sama seperti MALAS.

Pengecualian: fitur `admin`-only tanpa model relevan (Storage Settings, Database Backup, Site Settings) boleh pakai `abort_unless(auth()->user()->hasRole('admin'), 403)` langsung di controller.

---

## Menu Management

Menu disimpan di tabel `menus`, dipakai untuk sidebar **translator & admin saja** (reader tidak punya sidebar/menu-driven nav — cukup header + Global Search).

`CheckMenuAccess` middleware jalan di setiap request translator/admin:
1. Ambil menu berdasarkan route name saat ini.
2. Jika `is_maintenance = true` DAN user bukan admin → return halaman maintenance.
3. Jika role user tidak ada di `role_access` → abort 403.

Setiap menu baru wajib ditambahkan ke `MenuSeeder.php` dengan `updateOrCreate`.

---

## UX — Wajib

- Semua tombol yang trigger server request punya **loading state** (disable + spinner), pakai `router.visit()`/`router.post()` dengan `onStart`/`onFinish`.
- Form error tampil inline di bawah field, bukan hanya toast.
- Toast sukses pakai `sonner`, dukung tombol **Undo** untuk aksi reversible (mis. unfavorite, mark-as-read) via `flash.undo_url`/`undo_payload` — lihat `useFlash.ts`.
- Skeleton loading untuk data yang di-fetch (jangan blank page atau spinner full-page).
- Dialog konfirmasi shadcn untuk aksi destruktif (delete novel/chapter, ban translator) — bukan `confirm()` browser native.
- **Mobile-first**: semua halaman reader wajib responsive dari 375px ke atas — prioritas QA di sini duluan.

---

## Fitur yang Sudah Ada

Jangan duplikasi atau rebuild ulang fitur-fitur ini setelah dibangun — lihat `docs/PHASES.md` untuk status implementasi tiap fitur:

| Fitur | Lokasi |
|-------|--------|
| SSO login (translator/admin) | `Auth/SsoController` |
| Role gating (pending → translator via grant admin) | `Admin/Users/Show.tsx` + `UserController::updateRole()` |
| Novel CRUD + judul alternatif + creator autocomplete + genre/tag | `Translator/Novels/*` |
| Volume & Chapter CRUD + autosave + status draft/on_revision/published | `Translator/Chapters/*` |
| Import metadata dari AniList (kategori NOVEL) | `Admin/AniList/Index.tsx` + `AniListService` |
| Reader browse/search/filter (tanpa login) | `Public/Home.tsx` |
| Baca chapter + tracking device-based | `Public/Novels/Chapter.tsx` + `EnsureDeviceId` |
| Favorite (device-based) | `Public/FavoriteController` |
| Continue reading + indikator baca/belum | `Public/ContinueReadingController` |
| Sistem tiket (translator↔superadmin, reader↔translator/superadmin) | `Translator/Tickets/*`, `Public/Tickets/*`, `Admin/Tickets/*` |
| Menu Management | `Admin/Menus/*` |
| Announcements (translator/admin only) | `Admin/Announcements/*` |
| Command Palette (⌘K translator/admin) + Global Search (⌘K reader) | `CommandPalette.tsx`, `GlobalSearch.tsx` |
| Storage & Database Backup (admin only) | `Admin/Settings/Index.tsx` |
| Blur konten mature | `Admin/Settings/Index.tsx` (tab Konten) + `SiteSettingController` |
| Log aktivitas admin | `Admin/ActivityLog/Index.tsx` |
| Undo pada toast | `useFlash.ts` |

**Belum dikerjakan (backlog, lihat `docs/PHASES.md`):** Halaman profil publik translator, Loans/peminjaman (tidak relevan — dihapus dari scope karena Scribe bukan platform pinjam-fisik).

---

## Dilarang

- `any` di TypeScript.
- Inline CSS style.
- Custom HTML komponen jika sudah ada di shadcn/ui.
- Hardcode role/permission di frontend.
- Kirim data sensitif (access_token, refresh_token) ke Inertia props.
- Commit `.env` atau file yang mengandung secrets.
- Skip middleware atau bypass policy.
- `dd()` atau `var_dump()` di production code.
- Akses `Storage::` facade langsung di luar `StorageSettingsService`.
- Bangun sistem login/akun untuk reader — reader selalu anonim, device-based.
- Bangun fitur Loans/peminjaman — tidak relevan untuk platform baca digital.
- Mulai implementasi kalau pesan user diakhiri "gimana?" (itu diskusi).
