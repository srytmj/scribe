# PRD - Scribe (Light Novel Publishing CMS)

## Problem Statement

Freelance translator light novel butuh platform terpusat untuk publish hasil terjemahan tanpa perlu infrastruktur sendiri. Reader butuh satu tempat untuk browse dan baca karya dari banyak translator sekaligus, tanpa friksi pendaftaran akun.

## Target Users

- **Translator**: freelance/hobbyist penerjemah light novel (JP/KR/CN → ID/EN/dst) yang publish karya secara terstruktur (series → volume → chapter). Login via SSO whitearchive.id.
- **Reader**: pembaca anonim, tanpa akun. Browse, baca, favorite, dan lanjut baca lintas semua translator di satu platform.
- **Admin (superadmin)**: pengelola platform. Login via SSO whitearchive.id dengan role `superadmin`.

## Platform Model

Satu platform terpusat (`whitearchive.id`) — **bukan** subdomain per translator. Semua novel dari semua translator tampil di satu katalog. Tiap novel/post ditandai translator pemiliknya; translator punya halaman profil sendiri sebagai identitas, tanpa perlu domain terpisah.

## Core User Stories

### Reader (tanpa login/akun)
- Sebagai reader, saya ingin browse daftar novel dengan filter genre/tag/status dan search judul, supaya cepat menemukan bacaan dari translator manapun.
- Sebagai reader, saya ingin melihat detail novel (sinopsis, author, illustrator, judul alternatif, daftar chapter per volume), supaya tahu progress novel sebelum baca.
- Sebagai reader, saya ingin membaca chapter langsung di browser tanpa perlu akun.
- Sebagai reader, saya ingin chapter yang sedang direvisi translator ditandai jelas dan tidak bisa dibuka, supaya saya tahu itu belum final.
- Sebagai reader, saya ingin favorite novel (tersimpan di device saya), supaya bisa cek update tanpa perlu akun.
- Sebagai reader, saya ingin sistem mengingat chapter mana yang sudah/belum saya baca per novel (device-based), supaya bisa lanjut baca dari chapter terakhir seperti Wattpad.
- Sebagai reader, saya ingin mengirim tiket ke superadmin atau ke translator tertentu (misal request chapter), supaya bisa berkomunikasi tanpa perlu akun.

### Translator (login via SSO)
- Sebagai translator, saya ingin login pakai akun SSO whitearchive.id yang sudah ada, supaya tidak perlu daftar akun baru.
- Sebagai translator, saya ingin CRUD series (judul original, judul alternatif multi-bahasa, sinopsis, cover, author, illustrator, genre, tag), supaya mengelola karya saya dengan metadata lengkap.
- Sebagai translator, saya ingin memilih author/illustrator dari daftar yang sudah ada via autocomplete (atau bikin baru kalau belum ada), supaya data tidak duplikat.
- Sebagai translator, saya ingin CRUD volume (opsional) dan menulis chapter dengan editor mirip blog (bisa sisip gambar di tengah teks), supaya publish terjemahan dengan format rapi.
- Sebagai translator, saya ingin chapter yang sedang saya tulis ke-autosave otomatis, supaya tidak kehilangan progress kalau ada gangguan (laptop mati, dsb).
- Sebagai translator, saya ingin set status chapter (draft / on revision / published), supaya bisa menandai chapter yang perlu direvisi tanpa menghapusnya dari sistem.
- Sebagai translator, saya ingin publish novel/chapter langsung tanpa approval admin (karena platform terpusat, bukan subdomain terpisah).
- Sebagai translator, saya ingin mengirim tiket ke superadmin (bug report / feature request), supaya bisa melaporkan masalah teknis.

### Admin (superadmin, login via SSO)
- Sebagai admin, saya ingin melihat dashboard statistik (jumlah translator, jumlah novel yang sudah rilis, dsb), supaya punya gambaran kondisi platform.
- Sebagai admin, saya ingin melihat daftar user/translator (read-only — profil dikelola via SSO, bukan di Scribe), dan mengubah role lokal Scribe (grant/revoke akses translator).
- Sebagai admin, saya ingin moderasi (hapus) novel/chapter yang melanggar.
- Sebagai admin, saya ingin mengelola master data genre dan tag.
- Sebagai admin, saya ingin menerima dan merespons tiket dari translator maupun reader.

## Features

### P0 (Must Have — MVP)

- SSO login (OAuth2 + PKCE) untuk translator & admin — bukan sistem auth sendiri
- Local role gating: user baru dari SSO berstatus `pending` sampai admin grant role `translator`; SSO role `superadmin` otomatis map ke admin Scribe
- Admin dashboard: statistik platform (jumlah translator, jumlah novel released, dll)
- Admin: lihat user (read-only) + grant/revoke role translator
- Admin: moderasi novel & chapter (delete)
- Admin: CRUD genre & tag
- Translator: CRUD series/novel — judul original, judul alternatif (multi), sinopsis, cover, origin/translation language
- Translator: author & illustrator sebagai entity dengan autocomplete (create-if-not-exist)
- Translator: attach/detach genre & tag ke novel
- Translator: CRUD volume (opsional terhadap chapter)
- Translator: CRUD chapter — editor blog-style dengan sisip gambar, autosave, status draft/on_revision/published
- Reader: browse novel dengan filter genre/tag/status + search judul, tanpa login
- Reader: halaman detail novel (info lengkap + daftar chapter per volume); chapter on_revision ditandai dan tidak bisa dibuka
- Reader: baca chapter, tanpa login
- Reader: favorite novel (device-based, tanpa akun)
- Reader: continue reading + indikator chapter terbaca/belum (device-based)
- Ticketing: translator → superadmin (bug/feature request); reader → superadmin atau translator tertentu

### P1 (Should Have)

- Halaman profil publik translator (list karya + bio + donation link)
- Pagination / infinite scroll di listing novel
- Reader ticket page dengan pemilihan tujuan translator (UI detail didiskusikan terpisah)

### P2 (Nice to Have)

- Swap storage cover image dari local disk ke S3/R2
- Full-text search upgrade (`to_tsvector` PostgreSQL)
- Dark mode
- Sinkronisasi favorite/reading progress reader lintas device (butuh keputusan ulang soal akun reader kalau dibutuhkan nanti)

## Out of Scope (MVP)

- Sistem koin / monetisasi internal (hanya link eksternal Trakteer/Tako di profil translator)
- Comment & rating system
- Notifikasi (email/push)
- RSS feed
- PWA / mobile app
- Subdomain per translator
- Akun/login untuk reader

## Security Requirements

- Auth sepenuhnya via SSO (OAuth2 Authorization Code + PKCE), tidak ada password lokal
- State parameter tervalidasi server-side untuk cegah CSRF saat login
- Access & refresh token disimpan terenkripsi di server, tidak pernah ke client
- Logout wajib 2 tahap: clear session lokal, lalu redirect ke SSO logout endpoint
- Authorization berbasis Laravel Policy: translator hanya boleh modifikasi novel/chapter miliknya
- Admin tidak bisa edit data profil user (nama/email/avatar) — itu domain SSO, admin cuma atur role lokal Scribe
- Reader tracking (favorite, reading progress) berbasis device_id anonim, tidak terikat identitas pribadi apapun
- HTTPS enforced di production

## Success Metrics

- Translator bisa login via SSO dan publish novel pertama (series + minimal 1 chapter) end-to-end tanpa approval admin
- Reader bisa browse → baca → favorite dalam satu sesi tanpa perlu akun sama sekali
- Continue reading & status baca/belum akurat 100% per device
- Tiket dari translator/reader sampai ke tujuan yang benar (superadmin atau translator spesifik)
