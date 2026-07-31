# PHASES — Scribe

Log fase pengembangan. Menggantikan sistem tiket per-file (`docs/tickets/TASK-XXX.md`) yang dipakai sebelum rebuild ini — sekarang mengikuti pola MALAS: breakdown fase + checklist di satu dokumen, di-update progresnya langsung di sini oleh dev session.

Setelah 1 fase selesai, buka QA chat (`QA.md`, trigger kata `cek`) sebelum lanjut ke fase berikutnya.

---

## Fase 0 — Fondasi

- [x] Setup Laravel 12 + Inertia v2 + React 19 + TypeScript + Tailwind v4 + shadcn/ui (Base UI)
- [x] Spatie Permission terpasang, role `pending`/`translator`/`admin` ter-seed
- [x] Migration: `users` (uuid, sso fields, role, ban fields, soft delete)
- [x] SSO integration (`SsoController`): redirect, callback, profile sync, role mapping (superadmin→admin, user→pending), logout 2 tahap
- [x] `EnsureDeviceId` middleware untuk reader anonim
- [x] `EnsureNotBanned` middleware
- [x] Menu system: migration `menus`, `MenuSeeder`, `CheckMenuAccess` middleware
- [x] `StorageSettingsService` + migration `storage_settings` (driver local/s3, encrypted secret)
- [x] Layouts dasar: `AdminLayout.tsx`, `TranslatorLayout.tsx`, `PublicLayout.tsx`
- [x] Shared components dasar: `PageHeader.tsx`, `Pagination.tsx`, `EmptyState.tsx`, `StatusBadge.tsx`

## Fase 1 — Novel & Chapter Core

- [x] Migration: `novels`, `novel_alt_titles`, `creators` + pivot `novel_author`/`novel_illustrator`, `genres`/`tags` + pivot, `volumes`, `chapters`
- [x] `NovelPolicy`, `ChapterPolicy`, `VolumePolicy`
- [x] Translator: CRUD novel (judul, alt titles, cover via StorageSettingsService, creator autocomplete, genre/tag attach)
- [x] Translator: CRUD volume (opsional)
- [x] Translator: CRUD chapter (Tiptap editor, sisip gambar, autosave, status draft/on_revision/published)
- [x] Admin: moderasi novel/chapter lintas translator (bulk delete)

## Fase 2 — Reader (Public, Anonim)

- [ ] Migration: `favorites`, `chapter_reads`
- [ ] Public: browse & filter/search novel (tanpa login)
- [ ] Public: detail novel (chapter list per volume, badge on_revision, draft hidden server-side)
- [ ] Public: baca chapter + record `chapter_reads`
- [ ] Public: favorite/unfavorite (device-based)
- [ ] Public: continue reading + indikator baca/belum

## Fase 3 — Ticketing, Announcements, Activity Log

- [ ] Migration: `tickets`, `announcements` + pivot `announcement_user`, `activity_logs`
- [ ] `TicketPolicy`, `AnnouncementPolicy`
- [ ] Translator: buat & lihat tiket ke admin
- [ ] Public: reader buat tiket (device-based) ke admin atau translator tertentu — rate-limited
- [ ] Admin: respond tiket
- [ ] Admin: CRUD announcements (tampil ke translator/admin, dismiss per user)
- [ ] Admin: viewer activity log (audit grant/revoke role, ban, moderasi, storage settings change)

## Fase 4 — AniList Integration

- [ ] `AniListService` (GraphQL client, filter media type `NOVEL`)
- [ ] Search & import metadata novel dari AniList
- [ ] Sync ulang metadata (Popover "Sync AniList" di Edit Novel)

## Fase 5 — Dashboard, Search, Polish

- [ ] Admin dashboard: stat cards + chart (Novel per Status, Chapter per Status, Tiket per Status)
- [ ] Translator dashboard: stat cards + chart miliknya sendiri
- [ ] Command Palette (⌘K, translator/admin) — nav cepat + search Novel/Users/Tickets
- [ ] Global Search (⌘K, reader) — search katalog + nav cepat
- [ ] `useFlash.ts` hook — toast sonner + tombol Undo (unfavorite, mark-as-read)
- [ ] Site Settings: blur konten mature (`is_mature` novel + toggle admin)
- [ ] Database backup: download/import dump SQL (admin only)

## Fase 6 — Admin User Management

- [ ] Admin: list user (read-only dari SSO)
- [ ] Admin: grant/revoke role translator
- [ ] Admin: ban/unban user

---

## Backlog (Ditunda, Bukan MVP)

- Halaman profil publik translator + sistem follow + activity feed (gaya Steam) — sama seperti backlog MALAS
- Rekomendasi genre + "Surprise Me" ala MALAS Dashboard (butuh keputusan: apakah relevan tanpa konsep "koleksi" reader yang persistent ke akun)
- Sinkronisasi favorite/reading progress reader lintas device (butuh keputusan ulang soal akun reader kalau dibutuhkan nanti)

## Tidak Akan Dikerjakan (Bukan Backlog — Di Luar Scope Permanen)

- Loans/peminjaman — tidak relevan untuk platform baca digital
- Collection + personal rating/review ala MALAS — reader anonim, tidak ada akun untuk menyimpan data ini
- Akun/login untuk reader dalam bentuk apapun
- Subdomain per translator
