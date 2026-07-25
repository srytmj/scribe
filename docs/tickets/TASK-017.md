# TASK-017: Ticketing System (Translator ↔ Superadmin, Reader ↔ Translator/Superadmin)

Status: In Review
Priority: Medium
Created: 2026-07-23 20:00
Request: Translator bisa submit tiket (bug report / feature request) ke superadmin via `/dashboard/tickets`. Reader (tanpa akun, device-based) bisa submit tiket ke superadmin atau ke translator tertentu (misal request chapter) via `/tickets`. Admin kelola & respons tiket masuk di `/admin/tickets`. Detail UI halaman reader untuk memilih translator tujuan didiskusikan terpisah — buat backend & data model dulu di ticket ini, UI reader-facing lengkap masuk P1.

Karena `POST /tickets` bisa diakses reader anonim tanpa akun, wajib ada basic spam protection: rate-limit per `device_id`/IP (mis. throttle Laravel), dan pertimbangkan honeypot field atau captcha ringan kalau spam jadi masalah nyata setelah live.

---

## DEV Response

Scoping to exactly what the ticket asks: backend + data model + a minimal functional form for all three submission paths, not the polished reader-facing translator-picker UI (explicitly deferred to P1). The `Ticket` model already exists (added minimally in TASK-004 for dashboard stats) — extending its usage here, not creating it fresh.

- [x] `RateLimiter::for('tickets', ...)` in `AppServiceProvider` — 5/minute keyed by `device_id` (falls back to IP if somehow absent), applied via `throttle:tickets` on the public `POST /tickets` route only (translator/admin routes are already authenticated, so spam isn't the same threat there)
- [x] Honeypot on the public ticket form: a hidden `website` field that real users never fill; if present in the request, silently pretend success (redirect back with no error) instead of creating the ticket or revealing the trap to a bot — implemented by checking the honeypot *before* running validation at all in the controller (not as a `prohibited` validation rule, which would 422 and tip off the bot)
- [x] `StoreReaderTicketRequest` — `type` in bug/feature_request/chapter_request/other, `to_type` in superadmin/translator, `to_user_id` required *only* when `to_type=translator` and must reference an actual `role=translator` user (not just any user id)
- [x] `StoreTranslatorTicketRequest` — `type` in bug/feature_request/other (`chapter_request` doesn't make sense translator→admin, only reader→translator); `to_type` is always forced to `superadmin` server-side in the controller, never read from the request payload
- [x] `Public\TicketController@store` — `from_type=reader`, `from_device_id` from the `EnsureDeviceId` cookie
- [x] `Dashboard\TicketController@store` — `from_type=translator`, `from_user_id=auth()->id()`
- [x] `Admin\TicketController@index`/`@update` — list all tickets, `update` only changes `status` (the schema has no separate "response message" column — "merespons tiket" per SRS's own schema is a status transition, not a reply thread)
- [x] Minimal pages: `Pages/Tickets/Create.tsx` (public, generic form — no translator-picker, just a plain select of translators, per this ticket's explicit scope), `Pages/Dashboard/Tickets/Create.tsx`, `Pages/Admin/Tickets.tsx`; nav links added to both `DashboardLayout` and `AdminLayout`
- [x] Verified via tinker (direct controller invocation to sidestep CSRF, which a real browser handles automatically via Inertia but a raw test request doesn't): honeypot-filled submission returns an ordinary redirect and creates zero rows, valid reader→superadmin and reader→translator tickets create correctly with the right `from_device_id`/`to_user_id`, targeting a non-translator user id as the recipient throws a `ValidationException` and creates nothing, a translator's ticket has `to_type` forced to `superadmin` even when the payload tries to inject `to_type=translator`/`to_user_id=999`, admin status update applies. Rate limiter mechanism confirmed separately via the `RateLimiter` facade directly (5 allowed, 6th blocked; the registered `tickets` limiter correctly resolves a `Limit` keyed by `device_id` for a given request) — going around the HTTP layer here specifically because CSRF blocks raw test POSTs before the throttle middleware would even run, not because of any issue with the limiter itself.

---

## QA Response
[QA fills this]

- [ ] test case
