# Scribe — Agent Context

Baca file ini sebelum mengerjakan task apapun di project ini.

## Apa itu Scribe?

**Scribe** adalah CMS publishing light novel — salah satu project di bawah payung White Archive (bukan platform utama White Archive; root domain `whitearchive.id` adalah landing page ekosistem, di luar scope repo ini). Scribe hidup di `scribe.whitearchive.id`.

Tiga sisi:
- **Admin panel** — kelola user/translator, moderasi, menu, pengumuman, storage, backup
- **Translator dashboard** — kelola novel & chapter miliknya sendiri
- **Reader-facing (publik, tanpa login)** — browse katalog, baca chapter, favorite, continue reading

Struktur MVP dibangun mengikuti pola arsitektur project sister **MALAS** (manga library admin system), dengan fitur inti berbeda karena tujuan project berbeda (Scribe = publishing platform terjemahan light novel, bukan tracker koleksi pribadi).

---

## Stack

| | |
|--|--|
| Backend | Laravel 12 |
| Frontend | React 19 + TypeScript 5 via Inertia.js v2 |
| UI | shadcn/ui (Base UI) + Tailwind CSS v4 + Recharts + embla-carousel-react + cmdk |
| DB (dev) | SQLite |
| DB (prod) | MySQL 8+ |
| Auth | SSO whitearchive.id (PKCE OAuth2) + Spatie Permission — untuk translator & admin saja |
| Reader | Tidak login sama sekali — anonim, tracking via `device_id` cookie |
| Storage | Local disk atau S3-compatible (Cloudflare R2, dll), dikonfigurasi via UI admin, bukan `.env` |
| External API | AniList GraphQL — import metadata light novel (media type `NOVEL`) |
| Bundler | Vite |

---

## Roles

| Role | Deskripsi |
|------|-----------|
| `admin` | Akses penuh: moderasi, role management, menu, storage, backup, announcements. |
| `translator` | Manage novel & chapter miliknya sendiri. Didapat lewat grant admin, bukan self-register. |
| `pending` | Login SSO pertama kali, belum di-grant translator — tidak bisa akses `/dashboard` sama sekali. |
| Reader | Tidak ada akun. Browse, baca, favorite, continue reading — semua device-based. |

---

## Fitur Utama

1. **SSO Auth** — translator & admin login PKCE OAuth2 ke whitearchive.id; role lokal (`pending`/`translator`/`admin`) terpisah dari role SSO (`user`/`superadmin`)
2. **Menu Management** — admin toggle visibility & maintenance mode per menu (translator/admin sidebar)
3. **Novel & Chapter Management** — translator CRUD novel (judul + alt titles multi-bahasa, cover, creator autocomplete, genre/tag) dan chapter (editor Tiptap blog-style, autosave, status draft/on_revision/published)
4. **AniList Integration** — admin/translator cari & import metadata light novel dari AniList (kategori NOVEL): sinopsis, genre, author, skor, cover
5. **Reader Catalog & Reading** — browse/filter/search tanpa login, baca chapter, favorite, continue reading + indikator baca/belum — semua via `device_id`
6. **Sistem Tiket** — translator → admin (bug/feature request); reader → admin atau translator tertentu (mis. request chapter)
7. **Announcements** — pengumuman dari admin ke translator/admin (bukan ke reader, karena reader tidak punya akun untuk dismiss-tracking)
8. **Dashboard** — stat cards + chart (Recharts) untuk admin & translator
9. **Global Search / Command Palette** — ⌘K di translator/admin (Command Palette) dan reader (Global Search, tanpa login)
10. **Storage & Database Backup** — konfigurasi Local/S3 dan backup DB via UI (admin only)
11. **Log Aktivitas** — audit trail aksi sensitif admin
12. **Undo pada toast** — aksi reversible (unfavorite, mark-as-read) bisa di-undo dari notifikasi

**Sengaja TIDAK dibangun** (beda dari MALAS): Loans/peminjaman (tidak relevan untuk platform baca digital), Collection/rating pribadi reader (reader anonim, tidak ada akun untuk menyimpan rating), reader login/akun dalam bentuk apapun.

---

## Navigasi per Role

**Admin sidebar:**
Dashboard → Novel (semua, moderasi) → Pengguna → Tiket → Log Aktivitas → Menu → Pengumuman → AniList Search → Pengaturan

**Translator sidebar:**
Dashboard → Novel Saya → Tiket

**Reader (tanpa sidebar, header nav + Global Search):**
Beranda (katalog) → Favorit → Continue Reading

Ganti role user (grant/revoke translator, ban) dilakukan dari halaman detail user (`/admin/users/{id}`), bukan menu "Roles" terpisah — sama seperti MALAS.

---

## Key Commands

```bash
# Development
php artisan serve                 # start Laravel (port 8000)
npm run dev                       # start Vite

# Database
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed

# Type checking
npx tsc --noEmit                  # 0 error = pass

# Tinker
php artisan tinker

# Cache
php artisan optimize:clear
php artisan optimize
```

---

## Dokumen yang Wajib Dibaca

| File | Isi |
|------|-----|
| `CLAUDE.md` | Coding rules, struktur folder, larangan |
| `docs/prd.md` | Requirement lengkap + access matrix |
| `docs/ARCHITECTURE.md` | DB schema, folder structure, request lifecycle, auth flow |
| `docs/FLOWS.md` | Navigation map + user flows (termasuk SSO sequence) |
| `docs/PHASES.md` | Breakdown fase implementasi + checklist |
| `QA.md` | Instruksi untuk QA chat setelah kode selesai (trigger: `cek`) |
| `CHANGELOG.md` | Histori perubahan per tanggal |

---

## Pola Penting

### Controller → Inertia Page
```php
// Translator controller
return Inertia::render('Translator/Novels/Index', [
    'novels'  => NovelResource::collection($request->user()->novels()->paginate(20)),
    'filters' => request()->only(['status', 'search']),
]);
```

### Policy check di controller
```php
$this->authorize('update', $novel); // throws 403 jika bukan pemilik
```

### Reader route (tanpa auth)
```php
Route::middleware(['ensure.device'])->group(function () {
    Route::get('/', [Public\HomeController::class, 'index']);
    Route::get('/novels/{slug}', [Public\NovelController::class, 'show']);
});
```

### Menu maintenance check
`CheckMenuAccess` middleware otomatis dijalankan untuk route translator/admin. Tidak perlu manual check di controller.

### Form submission (Inertia)
```typescript
const form = useForm({ title: '', status: 'draft' })
form.post(route('translator.novels.store'), {
  onSuccess: () => toast.success('Novel berhasil disimpan'),
})
```

---

## Hal yang TIDAK Boleh Dilakukan

- Jangan mulai implementasi jika pesan user diakhiri "gimana?" (itu diskusi)
- Jangan modifikasi file di `resources/js/components/ui/` (shadcn source)
- Jangan skip middleware atau policy
- Jangan commit `.env`
- Jangan bangun sistem login/akun untuk reader
- Jangan bangun fitur Loans/peminjaman
