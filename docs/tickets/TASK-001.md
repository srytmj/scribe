# TASK-001: SSO Integration — Login, Callback, Logout, Role Mapping

Status: Open
Priority: High
Created: 2026-07-23 20:00
Request: Implement OAuth2 Authorization Code + PKCE flow ke sso.whitearchive.id sesuai AI_INTEGRATION.md — redirect login, callback dengan validasi state, tukar code ke token, profile sync ke local `users` (sso_id, name, username, email, sso_role). Logout wajib 2 tahap: clear session lokal lalu redirect ke SSO logout. Role mapping: SSO `superadmin` → Scribe `admin`, SSO `user` (login pertama) → Scribe `pending`. Env vars: SSO_CLIENT_ID, SSO_CLIENT_SECRET, SSO_REDIRECT_URI, SSO_BASE_URL.

---

## DEV Response
[DEV fills this]

- [ ] subtask

---

## QA Response
[QA fills this]

- [ ] test case
