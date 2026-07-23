# TODO

## MVP Build (lihat docs/tickets/ untuk breakdown lengkap)

- [ ] TASK-001 s/d TASK-018 — lihat `docs/tickets/`
- [ ] BUG-001 — perbaiki regex `sync.sh` (`parse_stack` salah eskep alternation grep)

## CI/CD Pipeline

- [ ] GitHub Actions workflow, trigger on push to `main`
  - Job: `composer install --no-dev` → `php artisan migrate --force` → `npm ci` → `vite build` → `artisan optimize` → SSH deploy ke EC2
  - Gate: `php artisan test` harus pass sebelum deploy step jalan
  - Catatan: sekarang monolith Laravel+Inertia, bukan lagi build frontend & backend terpisah seperti iterasi sebelumnya

## Menyusul / Perlu Briefing Lanjutan

- [ ] Avatar dari SSO — belum ada fiturnya di sso.whitearchive.id, pakai placeholder dulu. Update UI setelah briefing lanjutan.
- [ ] UI halaman reader untuk kirim tiket ke translator tertentu (pemilihan target translator) — didiskusikan detail terpisah, backend/model sudah masuk TASK-017.

## P1 (Should Have, di luar MVP awal)

- [ ] Halaman profil publik translator lengkap (TASK-018 sudah cover dasar)
- [ ] Pagination / infinite scroll di listing novel
