# SRS - Scribe (Light Novel Publishing CMS)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | Laravel 11 |
| Database | PostgreSQL |
| Frontend | Inertia.js + React |
| UI | Shadcn UI |
| Rich Text / Blog Editor | Tiptap (chapter content, support sisip gambar) |
| Auth | SSO whitearchive.id (OAuth2 Authorization Code + PKCE) — no local password |
| Storage | Local disk (MVP) → S3/R2 (later) via Laravel Filesystem |
| Domain (staging) | scribe.suryatmaja.dev |
| Domain (production, planned) | scribe.whitearchive.id |

---

## Platform Model

Satu platform terpusat. **Bukan** subdomain per translator. Semua novel dari semua translator tampil di satu katalog publik, ditandai kepemilikan translator masing-masing. Translator mendapat identitas lewat halaman profil (`/translator/{username}`), bukan domain terpisah.

---

## Auth: SSO Integration

Referensi: `AI_INTEGRATION.md` dari `sso.whitearchive.id`.

### Env Vars

```
SSO_CLIENT_ID=xxx
SSO_CLIENT_SECRET=xxx
SSO_REDIRECT_URI=https://scribe.suryatmaja.dev/auth/callback
SSO_BASE_URL=https://sso.whitearchive.id
```

### Endpoints (SSO)

| Endpoint | Fungsi |
|----------|--------|
| `GET /oauth/authorize` | Authorization request + PKCE challenge |
| `POST /oauth/token` | Tukar authorization code / refresh token |
| `GET /api/user` | Ambil profil user (butuh access token) |
| `GET /logout` | Terminasi session SSO, support `redirect_uri` |

### Flow

1. **Redirect**: generate PKCE code verifier + challenge, generate `state`, simpan di session server-side.
2. **Authorize**: redirect user ke `SSO_BASE_URL/oauth/authorize` dengan client_id, redirect_uri, code_challenge, state.
3. **Callback** (`/auth/callback`): validasi `state` terhadap session; tukar authorization code + code_verifier ke `/oauth/token`.
4. **Profile sync**: ambil profil via `/api/user`; create/update local `users` record berdasarkan `sso_id`.
5. **Session**: buat session aplikasi lokal; simpan access token (60 menit) & refresh token (30 hari, single-use) terenkripsi di server.
6. **Refresh**: implementasi refresh logic sebelum access token expired, update refresh token tiap kali dipakai.
7. **Logout (wajib 2 tahap)**: (a) hapus session lokal, (b) redirect ke `SSO_BASE_URL/logout` dengan `redirect_uri`. Skip tahap (b) menyebabkan auto-login di percobaan login berikutnya karena SSO session masih aktif.

### Role Mapping

SSO hanya punya 2 role global: `user` dan `superadmin`. Scribe punya role lokal sendiri, terpisah:

| SSO role | Scribe role (default) | Catatan |
|----------|------------------------|---------|
| `superadmin` | `admin` | Auto-mapped tiap login |
| `user` | `pending` (login pertama) | Admin Scribe grant manual jadi `translator` via `/admin/users/{id}/role` |

Avatar dari SSO **belum tersedia** — pakai placeholder default di UI sampai fitur avatar SSO dirilis (briefing menyusul).

---

## Database Schema

### users
```
id                 bigint PK
sso_id             varchar unique
name               varchar
username           varchar unique
email              varchar unique
avatar             varchar nullable    -- belum dipakai, placeholder di UI dulu
sso_role           enum(user, superadmin)   -- disync tiap login
role               enum(pending, translator, admin) default pending  -- role lokal Scribe
bio                text nullable
donation_url       varchar nullable    -- link Trakteer/Tako
access_token       text nullable       -- terenkripsi
refresh_token      text nullable       -- terenkripsi
token_expires_at   timestamp nullable
timestamps
```

### novels
```
id                    bigint PK
user_id               bigint FK(users)      -- translator pemilik
title                 varchar               -- judul original (ex: Jepang)
slug                  varchar unique
synopsis              text
cover_image           varchar nullable
status                enum(draft, ongoing, completed, hiatus, dropped) default draft
origin_language       varchar               -- ex: Japanese, Korean, Chinese
translation_language  varchar               -- ex: Indonesian
timestamps
```

### novel_alt_titles
```
id           bigint PK
novel_id     bigint FK(novels)
language     varchar     -- ex: Indonesian, English, Spanish
title        varchar
timestamps
```

### creators
Entity gabungan untuk author & illustrator — orang yang sama bisa jadi author di satu novel dan illustrator di novel lain tanpa duplikat data.
```
id      bigint PK
name    varchar unique
timestamps
```

### novel_author (pivot)
```
novel_id     bigint FK(novels)
creator_id   bigint FK(creators)
PRIMARY KEY(novel_id, creator_id)
```

### novel_illustrator (pivot)
```
novel_id     bigint FK(novels)
creator_id   bigint FK(creators)
PRIMARY KEY(novel_id, creator_id)
```

### volumes
```
id           bigint PK
novel_id     bigint FK(novels)
number       integer
title        varchar nullable   -- ex: "Volume 1: The Beginning"
timestamps
```

### chapters
```
id                  bigint PK
novel_id            bigint FK(novels)
volume_id           bigint FK(volumes) nullable
chapter_number      decimal(8,1)      -- support 1.5 untuk side story/interlude
title               varchar nullable
content             text              -- markdown/Tiptap JSON, support gambar inline
status              enum(draft, on_revision, published) default draft
published_at        timestamp nullable
last_autosaved_at   timestamp nullable
timestamps
UNIQUE(novel_id, volume_id, chapter_number)
```

### genres
```
id     bigint PK
name   varchar unique
slug   varchar unique
```

### novel_genre (pivot)
```
novel_id   bigint FK(novels)
genre_id   bigint FK(genres)
PRIMARY KEY(novel_id, genre_id)
```

### tags
Label bebas, beda dari genre (taksonomi tetap). Ex: isekai, reinkarnasi, slow-burn.
```
id     bigint PK
name   varchar unique
slug   varchar unique
```

### novel_tag (pivot)
```
novel_id   bigint FK(novels)
tag_id     bigint FK(tags)
PRIMARY KEY(novel_id, tag_id)
```

### favorites
Device-based, reader tanpa akun.
```
id           bigint PK
device_id    varchar     -- UUID di cookie/localStorage reader
novel_id     bigint FK(novels)
timestamps
UNIQUE(device_id, novel_id)
```

### chapter_reads
Device-based. Sumber untuk continue reading (chapter terakhir = MAX(read_at) per novel) dan indikator baca/belum per chapter.
```
id           bigint PK
device_id    varchar
chapter_id   bigint FK(chapters)
read_at      timestamp
UNIQUE(device_id, chapter_id)
```

### tickets
```
id                bigint PK
type              enum(bug, feature_request, chapter_request, other)
from_type         enum(translator, reader)
from_user_id      bigint FK(users) nullable    -- diisi kalau from_type = translator
from_device_id    varchar nullable             -- diisi kalau from_type = reader
to_type           enum(superadmin, translator)
to_user_id        bigint FK(users) nullable    -- target translator atau admin spesifik
subject           varchar
message           text
status            enum(open, in_progress, resolved, closed) default open
timestamps
```

---

## Module Breakdown

### 1. Auth (SSO)
- Login redirect + callback (OAuth2 PKCE)
- Profile sync ke local `users`
- Local role gating (pending/translator/admin)
- Logout 2 tahap

### 2. Novel/Series Management (translator)
- CRUD novel: judul original, judul alternatif (multi), sinopsis, cover, origin/translation language
- Author & illustrator: pilih via autocomplete dari `creators`, atau create baru kalau belum ada
- Attach/detach genre & tag
- Set status novel (draft/ongoing/completed/hiatus/dropped)

### 3. Volume & Chapter Management (translator)
- CRUD volume (opsional, nullable)
- CRUD chapter: editor blog-style (Tiptap) dengan sisip gambar inline
- Autosave berkala saat mengetik
- Status chapter: draft / on_revision / published

### 4. Reader (tanpa login)
- Browse novels (filter genre, tag, status, search judul)
- Novel detail page (metadata lengkap + daftar chapter per volume; chapter on_revision ditandai & tidak bisa dibuka)
- Read chapter — otomatis record ke `chapter_reads` via device_id
- Favorite/unfavorite novel (device-based)
- Continue reading + indikator chapter terbaca/belum

### 5. Admin
- Dashboard statistik (jumlah translator, jumlah novel released, dll)
- Lihat user (read-only, data dari SSO) + grant/revoke role translator
- Moderasi novel & chapter (delete)
- CRUD genre & tag
- Terima & respons tiket (translator & reader)

### 6. Ticketing
- Translator → superadmin (bug report / feature request)
- Reader → superadmin atau translator tertentu (ex: request chapter) — device-based, tanpa akun
- UI halaman reader untuk submit tiket didiskusikan terpisah (P1)

---

## Route Structure

### Public (tanpa login)
```
GET  /                                    → browse novels (filter & search)
GET  /novels/{slug}                       → novel detail + chapter list
GET  /novels/{slug}/{chapter}             → read chapter (tanpa volume)
GET  /novels/{slug}/vol-{vol}/{chapter}   → read chapter (dengan volume)
GET  /translator/{username}               → halaman profil publik translator
GET  /favorites                           → daftar favorite (device-based)
POST /favorites
DELETE /favorites/{novel}
GET  /continue-reading                    → daftar continue reading (device-based)
POST /tickets                             → reader submit tiket
```

### Auth (SSO)
```
GET  /auth/login       → redirect ke SSO authorize
GET  /auth/callback    → handle SSO callback, profile sync
POST /auth/logout      → 2-stage logout
```

### Translator Dashboard (role: translator)
```
GET    /dashboard                                   → daftar novel milik translator
GET    /dashboard/novels/create
POST   /dashboard/novels
GET    /dashboard/novels/{id}/edit
PUT    /dashboard/novels/{id}
DELETE /dashboard/novels/{id}
GET    /dashboard/novels/{id}/chapters
GET    /dashboard/novels/{id}/chapters/create
POST   /dashboard/novels/{id}/chapters
GET    /dashboard/novels/{id}/chapters/{cid}/edit
PUT    /dashboard/novels/{id}/chapters/{cid}
PATCH  /dashboard/novels/{id}/chapters/{cid}/autosave
DELETE /dashboard/novels/{id}/chapters/{cid}
GET    /dashboard/creators/search                    → autocomplete author/illustrator
POST   /dashboard/tickets                            → translator submit tiket ke superadmin
```

### Admin (role: admin)
```
GET    /admin                          → dashboard statistik
GET    /admin/users                    → read-only, data dari SSO
PUT    /admin/users/{id}/role          → grant/revoke role translator (role lokal Scribe)
GET    /admin/novels
DELETE /admin/novels/{id}
GET    /admin/chapters
DELETE /admin/chapters/{id}
GET    /admin/genres
POST   /admin/genres
DELETE /admin/genres/{id}
GET    /admin/tags
POST   /admin/tags
DELETE /admin/tags/{id}
GET    /admin/tickets
PUT    /admin/tickets/{id}
```

---

## Key Architectural Decisions

1. **Auth sepenuhnya via SSO whitearchive.id** — tidak ada password lokal, tidak ada register form. Hanya translator & admin yang login; reader sepenuhnya anonim.
2. **Role SSO vs role Scribe terpisah.** SSO cuma punya `user`/`superadmin`. Scribe punya role lokal `pending`/`translator`/`admin`. `superadmin` SSO auto-map ke admin Scribe; `user` SSO masuk sebagai `pending` sampai di-grant admin.
3. **Platform terpusat, bukan subdomain per translator.** Satu katalog untuk semua translator — reader browse/baca lintas translator tanpa pindah domain. Translator dapat identitas lewat halaman profil, bukan domain sendiri.
4. **Reader sepenuhnya anonim, device-based.** Favorite dan reading progress (`chapter_reads`) di-key oleh `device_id` (cookie/localStorage), tidak terikat akun. Trade-off: tidak sync lintas device, hilang kalau cookie di-clear — disepakati sebagai trade-off yang oke untuk MVP.
5. **chapter_number pakai `decimal(8,1)`**, bukan integer. Support chapter 1.5, 2.5 untuk side story/interlude.
6. **Volume opsional.** `volume_id` nullable di chapters.
7. **Tidak ada publish-approval flow.** Karena platform terpusat (bukan subdomain), translator publish novel/chapter langsung tanpa perlu approval admin.
8. **Chapter punya 3 status**: `draft` (belum dipublish, private), `on_revision` (pernah published, sedang direvisi — reader lihat badge & tidak bisa buka), `published` (tampil normal ke reader).
9. **Autosave chapter.** Konten ke-save otomatis berkala saat translator mengetik (`last_autosaved_at` di-update), mencegah kehilangan progress.
10. **Author & Illustrator sebagai entity (`creators`)**, bukan free text — dipilih via autocomplete, create-if-not-exist. Satu tabel dipakai untuk keduanya via pivot terpisah (`novel_author`, `novel_illustrator`) supaya orang yang sama tidak terduplikasi.
11. **Genre vs Tag terpisah.** Genre = taksonomi tetap (dikelola admin). Tag = label bebas tambahan (dikelola admin, dipakai translator).
12. **Avatar dari SSO belum tersedia.** UI pakai placeholder default; fitur avatar menyusul briefing terpisah.
13. **Ticketing dua arah.** Translator → superadmin (bug/feature). Reader → superadmin atau translator tertentu (device-based, tanpa akun).
14. **Cover image di local disk MVP.** Path relatif, mudah swap ke S3/R2 via Laravel Filesystem.
15. **Search via PostgreSQL ILIKE.** Tidak perlu Elasticsearch untuk MVP.
16. **Authorization via Laravel Policies.** Translator hanya bisa edit novel & chapter miliknya sendiri.

---

## Acceptance Criteria

| Feature | Criteria |
|---------|----------|
| SSO Login | Translator/admin login via SSO PKCE flow, profil ter-sync ke local `users`. |
| Role gating | User baru dari SSO (`user`) masuk sebagai `pending`, tidak bisa akses `/dashboard` sampai admin grant `translator`. `superadmin` SSO otomatis jadi admin Scribe. |
| Logout | Logout menghapus session lokal DAN redirect ke SSO logout — login berikutnya tidak auto-login. |
| Novel CRUD | Translator bisa create/edit/delete novel miliknya, tidak bisa edit novel translator lain. Judul alternatif bisa lebih dari satu bahasa. |
| Author/Illustrator | Bisa pilih dari daftar existing via autocomplete atau bikin baru; tidak ada duplikat nama. |
| Chapter CRUD | Chapter tersimpan dengan rich content (support gambar inline). Draft & on_revision tidak muncul/tidak bisa dibuka di halaman publik. |
| Autosave | Konten chapter ke-save otomatis tanpa translator klik simpan manual. |
| Volume opsional | Chapter tanpa volume tetap valid dan tampil flat di novel detail. |
| Browse & filter | Filter genre/tag/status dan search judul mengembalikan hasil yang sesuai, lintas semua translator. |
| Favorite | Reader bisa favorite/unfavorite tanpa akun, tidak duplikat per device (UNIQUE constraint). |
| Continue reading | `chapter_reads` ter-upsert benar per device+chapter; continue reading menampilkan chapter terakhir per novel dengan benar. |
| Role promote | Hanya admin yang bisa mengubah role lokal user via `/admin/users/{id}/role`. |
| Admin read-only user data | Admin tidak bisa edit nama/email/avatar user — data itu murni dari SSO. |
| Authorization | Translator yang mencoba edit novel/chapter bukan miliknya ditolak (403). |
| Ticketing | Tiket dari translator sampai ke superadmin; tiket dari reader sampai ke superadmin atau translator tujuan yang benar. |

---

## Out of Scope (MVP)

- Sistem koin / monetisasi internal
- Comment & rating system
- Notifikasi (email/push)
- RSS feed
- PWA / mobile app
- Subdomain per translator
- Akun/login untuk reader
- Sinkronisasi favorite/reading progress lintas device
