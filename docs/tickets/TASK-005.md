# TASK-005: Admin — User List (Read-Only) + Grant/Revoke Role Translator

Status: In Review
Priority: High
Created: 2026-07-23 20:00
Request: Halaman `/admin/users` menampilkan semua user yang pernah login (data name/email/avatar read-only, murni dari SSO sync — tidak bisa diedit dari Scribe). Admin bisa ubah kolom `role` lokal Scribe (grant `pending` → `translator`, atau revoke kembali) via PUT `/admin/users/{id}/role`. Tidak boleh ada UI untuk edit profil user.

---

## DEV Response

- [x] `UpdateUserRoleRequest`: `role` restricted to `in:pending,translator` only — **`admin` is deliberately excluded**. Per SRS role mapping, `admin` is auto-derived from SSO `superadmin` on every login (`SsoService::syncUser`), never admin-settable locally; also blocks the request entirely if the target user's *current* role is already `admin`, since that role is SSO-owned and any local change would just get overwritten (or worse, silently diverge) on the user's next login
- [x] `Admin\UserController@index` — read-only list of all synced users (name/username/email/avatar/sso_role/role), explicitly no name/email/avatar edit fields anywhere in the payload or UI (SRS: that's SSO's domain)
- [x] `Admin\UserController@updateRole` — `PUT /admin/users/{id}/role`
- [x] `Pages/Admin/Users.tsx` — card list with grant/revoke buttons touching only `role`; no edit affordance for any SSO-owned field. Linked from `AdminLayout` nav
- [x] Verified via tinker: grant pending→translator, revoke translator→pending, `role=admin` rejected by the validation rule itself, attempting to change an already-`admin` user's role rejected by the `withValidator` guard (and confirmed the role stayed unchanged), index payload shape confirmed read-only-appropriate

---

## QA Response
[QA fills this]

- [ ] test case
