# Scribe — User Flow & Auth Sequence

## Alur Utama (Reader, Translator, Admin)

```mermaid
flowchart TD
    Start([Akses scribe.whitearchive.id]) --> Visitor{Siapa yang akses?}

    Visitor -->|Reader anonim| RGetDevice[Generate/ambil device_id dari cookie]
    RGetDevice --> RBrowse[Browse novel: filter genre/tag/status, search judul]
    RBrowse --> RDetail[Buka halaman detail novel]
    RDetail --> RChapterList{Status chapter?}
    RChapterList -->|published| RRead[Baca chapter]
    RChapterList -->|on_revision| RBlocked["Badge 'sedang disunting', tidak bisa dibuka"]
    RChapterList -->|draft| RHidden[Tidak tampil ke reader]
    RRead --> RTrack[Upsert chapter_reads by device_id]
    RTrack --> RContinue["Muncul di /continue-reading + indikator baca/belum"]
    RDetail --> RFav[Favorite novel - device based]
    RFav --> RFavList[Muncul di /favorites]
    RRead --> RTicket["Opsional: kirim tiket ke translator/superadmin"]

    Visitor -->|Translator / Admin| SSOLogin["Klik Login -> redirect SSO authorize + PKCE"]
    SSOLogin --> SSOCallback["Callback: tukar code, sync profile"]
    SSOCallback --> RoleCheck{Role dari SSO?}
    RoleCheck -->|superadmin| AdminRole[Role lokal = admin]
    RoleCheck -->|user, login pertama| PendingRole[Role lokal = pending]
    PendingRole --> WaitGrant[Menunggu admin grant akses]
    WaitGrant -->|di-grant admin| TranslatorRole[Role lokal = translator]

    TranslatorRole --> Dashboard[Dashboard translator]
    Dashboard --> NovelCRUD["CRUD novel: judul + judul alternatif, cover, author/illustrator, genre/tag"]
    NovelCRUD --> VolumeCRUD[CRUD volume - opsional]
    VolumeCRUD --> ChapterEditor[Tulis chapter: editor blog-style + sisip gambar]
    ChapterEditor --> Autosave[Autosave berkala saat mengetik]
    Autosave --> StatusToggle{Translator set status chapter}
    StatusToggle -->|draft| Draft[Privat, belum tampil ke reader]
    StatusToggle -->|published| Published[Langsung tampil ke reader, tanpa approval admin]
    StatusToggle -->|on_revision| Revision[Tampil dengan badge, tidak bisa dibuka reader]
    Dashboard --> TranslatorTicket[Kirim tiket bug/feature ke superadmin]

    AdminRole --> AdminPanel[Admin panel]
    AdminPanel --> AdminStats[Dashboard statistik platform]
    AdminPanel --> AdminUsers["Lihat user - read only + grant/revoke role translator"]
    AdminPanel --> AdminModerate[Moderasi novel/chapter melanggar]
    AdminPanel --> AdminTaxonomy[CRUD genre & tag]
    AdminPanel --> AdminTickets[Kelola tiket masuk dari translator & reader]
```

---

## SSO Auth Sequence (Login & Logout 2 Tahap)

```mermaid
sequenceDiagram
    participant U as Browser (Translator/Admin)
    participant S as Scribe (Laravel)
    participant SSO as sso.whitearchive.id

    U->>S: GET /auth/login
    S->>S: Generate PKCE verifier+challenge, state -> simpan di session
    S-->>U: Redirect ke SSO authorize
    U->>SSO: GET /oauth/authorize (client_id, code_challenge, state)
    SSO-->>U: Redirect ke /auth/callback?code=...&state=...
    U->>S: GET /auth/callback
    S->>S: Validasi state terhadap session
    S->>SSO: POST /oauth/token (code + code_verifier)
    SSO-->>S: access_token (60m), refresh_token (30d)
    S->>SSO: GET /api/user (Bearer access_token)
    SSO-->>S: profile: sso_id, name, username, email, sso_role
    S->>S: Upsert local users, map role (superadmin->admin, user->pending), buat session
    S-->>U: Redirect ke dashboard/admin

    Note over U,SSO: Logout wajib 2 tahap - skip tahap 2 = auto-login berikutnya
    U->>S: POST /auth/logout
    S->>S: Hapus session lokal
    S-->>U: Redirect ke SSO /logout?redirect_uri=...
    U->>SSO: GET /logout
    SSO-->>U: Redirect balik ke Scribe, SSO session invalid
```

---

## Catatan

- Reader tidak pernah menyentuh alur SSO — seluruh interaksi reader anonim, murni berbasis `device_id` di cookie/localStorage.
- Tidak ada langkah approval/publish-request antara "translator set published" dan "chapter tampil ke reader" — platform terpusat, publish langsung.
- Chapter `on_revision` tetap ada di database dan tetap terhubung ke novel/volume-nya, hanya disembunyikan dari akses baca reader.
