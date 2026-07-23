# TASK-017: Ticketing System (Translator ↔ Superadmin, Reader ↔ Translator/Superadmin)

Status: Open
Priority: Medium
Created: 2026-07-23 20:00
Request: Translator bisa submit tiket (bug report / feature request) ke superadmin via `/dashboard/tickets`. Reader (tanpa akun, device-based) bisa submit tiket ke superadmin atau ke translator tertentu (misal request chapter) via `/tickets`. Admin kelola & respons tiket masuk di `/admin/tickets`. Detail UI halaman reader untuk memilih translator tujuan didiskusikan terpisah — buat backend & data model dulu di ticket ini, UI reader-facing lengkap masuk P1.

Karena `POST /tickets` bisa diakses reader anonim tanpa akun, wajib ada basic spam protection: rate-limit per `device_id`/IP (mis. throttle Laravel), dan pertimbangkan honeypot field atau captcha ringan kalau spam jadi masalah nyata setelah live.

---

## DEV Response
[DEV fills this]

- [ ] subtask

---

## QA Response
[QA fills this]

- [ ] test case
