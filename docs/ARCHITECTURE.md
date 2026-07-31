# ARCHITECTURE — Scribe

**Versi:** 1.0
**Diperbarui:** 2026-07-26

> Dokumen ini menggambarkan arsitektur **target** aplikasi (rebuild total mengikuti pola MALAS). Untuk histori perubahan, lihat [`CHANGELOG.md`](../CHANGELOG.md). Untuk breakdown fase implementasi, lihat [`PHASES.md`](PHASES.md).

---

## 1. Tech Stack

| Layer | Teknologi | Versi | Alasan |
|-------|-----------|-------|--------|
| Backend | Laravel | 12 | Mature, ekosistem besar, auth/policy built-in |
| Frontend bridge | Inertia.js | v2 | SPA feel tanpa API layer terpisah |
| Frontend | React | 19 | Ekosistem terbesar, futureproof |
| Language | TypeScript | 5 | Type safety |
| UI Components | shadcn/ui (Base UI) | latest | Copy-paste, bukan dependency black-box; pakai `render` prop bukan `asChild` |
| Styling | Tailwind CSS | v4 | Utility-first, konsisten dengan shadcn |
| Bundler | Vite | latest | Fast HMR |
| Auth/Role | Spatie Permission | latest | RBAC untuk translator/admin (reader tidak pakai sistem ini sama sekali) |
| Auth SSO | whitearchive.id | — | PKCE OAuth2; translator & admin login lewat SSO, reader anonim sepenuhnya |
| DB (dev) | SQLite | 3 | Zero config |
| DB (prod) | MySQL | 8+ | Proven untuk production |
| Storage | Local disk atau S3-compatible (Cloudflare R2, dll) | — | Konfigurasi via UI admin (`storage_settings`), bukan `.env` |
| External API | AniList GraphQL | — | Import metadata light novel (media type `NOVEL`) |
| Charts | Recharts + `ui/chart.tsx` | latest | Dashboard admin & translator |
| Command menu | cmdk + `ui/command.tsx` | latest | Command Palette (translator/admin) & Global Search (reader) |

**Deviasi dari MALAS:** tidak ada `embla-carousel-react` (fitur rekomendasi/Surprise Me MALAS tidak diadopsi di MVP — lihat PHASES.md backlog); reader tidak menyentuh Spatie Permission/SSO sama sekali.

---

## 2. Database Schema

### `users`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| sso_id | string unique | nullable |
| name | string | |
| username | string | nullable |
| email | string unique | |
| avatar | string | nullable — placeholder di UI, SSO belum ada fitur avatar |
| password | string | nullable (akun SSO, tidak dipakai) |
| role | enum | `pending`, `translator`, `admin` — role lokal Scribe, terpisah dari role SSO (`user`/`superadmin`) |
| is_banned | boolean | default false |
| ban_reason | text | nullable |
| banned_at | timestamp | nullable |
| bio | text | nullable |
| donation_url | string | nullable — link Trakteer/Tako |
| deleted_at | timestamp | soft delete |
| created_at / updated_at | timestamp | |

### `novels`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| user_id | uuid FK(users) | translator pemilik |
| anilist_id | bigint unique | nullable |
| title | string | judul original, required |
| slug | string unique | |
| synopsis | text | nullable |
| cover_path | string | nullable — via `StorageSettingsService` |
| status | enum | `draft`, `ongoing`, `completed`, `hiatus`, `dropped` |
| origin_language | string | nullable |
| translation_language | string | nullable |
| anilist_score | decimal(4,2) | nullable — informational, bukan rating reader |
| is_mature | boolean | default false — untuk blur konten |
| deleted_at | timestamp | soft delete |
| created_at / updated_at | timestamp | |

**Deviasi dari MALAS:** `genres`/`authors`/`themes` MALAS disimpan sebagai json mentah dari AniList. Scribe menormalisasi ke tabel (`genres`, `tags`, `creators`) karena reader-facing filter/search butuh struktur query-able, dan translator butuh autocomplete create-if-not-exist untuk author/illustrator — bukan sekadar tampilan.

### `novel_alt_titles`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| novel_id | uuid FK(novels) | |
| language | string | ex: Indonesian, English |
| title | string | |

### `creators`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| name | string unique | |

### `novel_author` / `novel_illustrator` *(pivot)*
| Kolom | Tipe |
|-------|------|
| novel_id | uuid FK(novels) |
| creator_id | uuid FK(creators) |

### `volumes`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| novel_id | uuid FK(novels) | |
| number | int | |
| title | string | nullable |
| deleted_at | timestamp | soft delete |
| **UNIQUE** | (novel_id, number) | |

### `chapters`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| novel_id | uuid FK(novels) | |
| volume_id | uuid FK(volumes) | nullable |
| chapter_number | decimal(8,1) | support 1.5 untuk side story |
| title | string | nullable |
| content | text | Tiptap, support gambar inline |
| status | enum | `draft`, `on_revision`, `published` |
| published_at | timestamp | nullable |
| last_autosaved_at | timestamp | nullable |
| deleted_at | timestamp | soft delete |
| **UNIQUE** | (novel_id, volume_id, chapter_number) | |

### `genres` / `tags` (+ `novel_genre` / `novel_tag` pivot)
Master data dikelola admin, translator attach/detach ke novel. `genres` = taksonomi tetap, `tags` = label bebas.

### `favorites`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| device_id | string | cookie httpOnly reader, tidak terikat `users` |
| novel_id | uuid FK(novels) | |
| **UNIQUE** | (device_id, novel_id) | |

### `chapter_reads`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| device_id | string | |
| chapter_id | uuid FK(chapters) | |
| read_at | timestamp | |
| **UNIQUE** | (device_id, chapter_id) | sumber continue reading (MAX read_at per novel) & indikator baca/belum |

### `tickets`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | |
| user_id | uuid FK(users) | nullable — translator pengirim, cascade delete |
| device_id | string | nullable — reader pengirim (anonim) |
| novel_id | uuid FK(novels) | nullable, null on delete — konteks opsional |
| to_user_id | uuid FK(users) | nullable — translator tujuan; null = ke admin |
| subject | string | |
| type | enum | `bug`, `feature_request`, `chapter_request`, `other` |
| message | text | |
| status | enum | `open`, `in_progress`, `resolved`, `closed` |
| admin_response | text | nullable |
| responded_by | uuid FK(users) | nullable, null on delete |
| responded_at | timestamp | nullable |

### `storage_settings`
Identik dengan MALAS — single-row table, `driver` (local/s3), credentials, `secret_access_key` ter-encrypt, `endpoint`/`region`/`url` untuk S3-compatible custom.

### `menus`
Identik dengan MALAS — `key`, `label`, `icon`, `route_name`, `parent_key`, `sort_order`, `is_visible`, `is_maintenance`, `maintenance_message`, `role_access` (json, isi `["translator","admin"]`).

### `announcements` (+ `announcement_user` pivot)
Identik dengan MALAS, tapi scope-nya cuma translator & admin (reader tidak punya akun untuk dismiss-tracking per user).

### `activity_logs`
Audit trail aksi sensitif admin (grant/revoke role, ban, moderasi delete, ubah storage settings).

### `site_settings`
Single-row. `blur_mature_content` boolean — dipakai untuk blur cover novel yang `is_mature = true`.

**Tidak diadopsi dari MALAS:** `collections`, `collection_volumes`, `loans` — tidak relevan karena reader anonim (tidak ada "koleksi pribadi" tersimpan ke akun) dan Scribe bukan platform pinjam fisik/digital.

---

## 3. Folder Structure

Lihat [`CLAUDE.md`](../CLAUDE.md) bagian "Struktur Folder" untuk detail lengkap `app/` dan `resources/js/`.

Perbedaan struktural utama dari MALAS: folder controller/page dipisah 3 arah — `Admin/`, `Translator/` (pengganti `User/` MALAS, karena "user" MALAS = konsumen pasif, sedangkan "translator" Scribe = content creator), dan `Public/` (baru — reader anonim, tidak ada di MALAS karena MALAS tidak punya konsep anonim).

---

## 4. Request Lifecycle

### Translator / Admin
```
Browser → Laravel Router
       → auth middleware       (cek login via SSO session)
       → not_banned            (cek is_banned)
       → check.menu            (cek is_maintenance + role_access dari tabel menus)
       → Controller            (authorize via Policy / ownership check)
       → Inertia::render()
       → React render di browser
```

### Reader (Public)
```
Browser → Laravel Router
       → ensure.device         (assign device_id cookie kalau belum ada)
       → Controller            (tidak ada auth check sama sekali)
       → Inertia::render()
       → React render di browser
```

---

## 5. Authorization Flow

```
1. Route middleware: auth + not_banned + check.menu   (translator/admin saja)
2. Controller: $this->authorize('action', $model)     ← via Laravel Policy
3. Policy: $user->hasRole('admin') || $novel->user_id === $user->id
```

Contoh policy:
```php
// NovelPolicy.php
public function update(User $user, Novel $novel): bool
{
    return $user->hasRole('admin') || $novel->user_id === $user->id;
}
```

Pengecualian: fitur `admin`-only tanpa model relevan (Storage Settings, Database Backup, Site Settings) memakai `abort_unless(auth()->user()->hasRole('admin'), 403)` langsung di controller.

---

## 6. Menu System

Sama seperti MALAS, berlaku untuk translator & admin saja:

```
Setiap request translator/admin → CheckMenuAccess middleware:
1. Ambil current route name
2. Cari di tabel menus WHERE route_name = current_route
3. Jika tidak ditemukan → skip
4. Jika is_maintenance = true AND user bukan admin → return Maintenance page
5. Jika user role tidak ada di role_access → abort(403)
6. Pass → lanjut ke controller
```

Reader tidak melewati middleware ini sama sekali — route publik tidak terdaftar di tabel `menus`.

---

## 7. File Storage

Sama seperti MALAS — semua file (cover novel, gambar inline chapter) lewat **`StorageSettingsService`**, tidak ada kode lain yang boleh memanggil `Storage::` facade langsung.

- Konfigurasi disimpan di `storage_settings`, dikelola via `/admin/settings/storage`.
- Path convention: `covers/{uuid}.{ext}` untuk cover upload manual; `covers/anilist_{uniqid}.{ext}` untuk cover dari AniList; `chapter-images/{uuid}.{ext}` untuk gambar inline chapter.

---

## 8. Integrasi Eksternal

### AniList GraphQL
- Endpoint: `https://graphql.anilist.co`
- Filter media type `NOVEL` (AniList mencakup light novel di kategori ini)
- Dipakai untuk search & import metadata novel (judul, sinopsis, genre, author jika tersedia, skor, cover) dari `Admin/AniList/Index.tsx` (dan/atau `Translator/AniList` — lihat PHASES.md untuk keputusan akses)
- Sync ulang metadata tersedia dari Popover "Sync AniList" di halaman Edit Novel

### SSO whitearchive.id
- PKCE OAuth2. Translator & admin login lewat SSO — tidak ada form register/login lokal.
- Flow: `/auth/redirect` → whitearchive.id → `/auth/callback` (`SsoController`) → user dibuat/diupdate dari klaim SSO (`sso_id`, `name`, `username`, `email`, `avatar`) → role lokal dipetakan (`superadmin`→`admin`, `user`→`pending` kalau baru) → session dibuat.
- Logout 2 tahap: hapus session lokal → redirect SSO logout endpoint.
- Reader tidak pernah menyentuh flow ini.
