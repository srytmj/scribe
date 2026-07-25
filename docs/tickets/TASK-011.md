# TASK-011: Chapter CRUD — Editor Blog-Style + Autosave + Status

Status: In Review
Priority: High
Created: 2026-07-23 20:00
Request: Translator dashboard untuk create/edit/delete chapter: chapter_number (decimal 8,1), title (nullable), content via Tiptap editor mirip blog (support sisip gambar di tengah teks), volume_id (opsional), status (draft/on_revision/published). Autosave berkala saat translator mengetik (endpoint PATCH .../chapters/{id}/autosave, update content + last_autosaved_at tanpa ubah status). Validasi UNIQUE(novel_id, volume_id, chapter_number). Chapter berstatus draft atau on_revision tidak boleh diakses reader.

Termasuk: endpoint upload gambar inline untuk Tiptap (mis. `POST /dashboard/chapters/{id}/images`), simpan ke local disk terpisah dari cover (`storage/app/public/chapter-images/`), kembalikan URL untuk disisipkan editor. Validasi tipe file & ukuran max sama seperti cover image.

---

## DEV Response

Deviating from the ticket's suggested `POST /dashboard/chapters/{id}/images` path: there's no `chapter_images` table in the schema (SRS stores chapter content as a single text/JSON blob with images embedded by URL, no relational image tracking), and a chapter may not exist yet while the translator is still composing it on the Create page. Using `POST /dashboard/novels/{novel}/chapters/images` instead — ownership is checked via the novel (which always exists), and it works identically whether the chapter has been saved yet or not.

- [x] **Schema gotcha caught before writing validation**: the `UNIQUE(novel_id, volume_id, chapter_number)` DB constraint from TASK-002 does NOT actually prevent duplicates when `volume_id IS NULL` — PostgreSQL (and SQLite) treat NULL as distinct from NULL in unique indexes, so two volume-less chapters on the same novel with the same `chapter_number` would both insert successfully at the DB level. Enforced explicitly in the Form Request (`whereNull('volume_id')` branch) instead of relying on `exists`/`unique` alone. Confirmed via tinker: the exact scenario that would slip past the DB constraint is correctly rejected.
- [x] `StoreChapterRequest`/`UpdateChapterRequest`/`AutosaveChapterRequest` — chapter_number decimal(8,1) required, title nullable, volume_id nullable (must belong to the same novel), status enum, content required on store/update; autosave request only accepts `content`
- [x] `ChapterService`: create/update (sets `published_at` the first time status becomes `published`, never overwritten afterward so it reflects "first published", not "last edited"), `autosave` (content + `last_autosaved_at` only, explicitly untouched status), `delete`, `storeInlineImage`
- [x] `Dashboard\ChapterController`: index (per novel), create, store, edit, update, destroy — thin, delegates to `ChapterService`; `Dashboard\ChapterImageController@store` for Tiptap inline image upload (same validation as cover: image type, 4MB max), stored under `storage/app/public/chapter-images/`. Every action that takes both `{novel}` and `{chapter}` route params has an explicit `abort_unless($chapter->novel_id === $novel->id, 404)` guard — same cross-parent-mismatch class of bug caught and fixed in TASK-010's volumes
- [x] `PATCH /dashboard/novels/{novel}/chapters/{chapter}/autosave` — separate route/controller action so it can never accidentally touch `status`
- [x] Reader-facing access block (draft/on_revision not reachable) is TASK-014's concern, not this one — noting it here so it isn't silently assumed already handled
- [x] `Components/ChapterEditor.tsx` — Tiptap wrapper (StarterKit + Image extension), image upload toolbar button, debounced (2s) autosave firing `PATCH .../autosave`
- [x] Pages: `Dashboard/Chapters/Index.tsx`, `Create.tsx`, `Edit.tsx` (per SRS's page list) — volume picker (optional, scoped to the novel), status select, chapter_number input, "Manage Chapters" link added to the Novel edit page
- [x] Verified via tinker: `published_at` set on first publish and preserved across on_revision→published cycles (not bumped on re-publish), autosave updates content + `last_autosaved_at` while leaving `status` untouched, duplicate null-volume chapter_number rejected (the DB-constraint gap above), same number allowed on a different volume, foreign volume_id rejected, cross-novel chapter access 404s, inline image upload stores to `chapter-images/` and returns a working public URL

**Note for QA:** production bundle is now ~845KB (up from ~440KB) after adding Tiptap — still builds fine and isn't a functional issue, but flagging since it crossed Vite's 500KB chunk-size warning threshold. Worth a code-splitting pass later if load time on the chapter editor page becomes a concern; out of scope for this ticket.

---

## QA Response
[QA fills this]

- [ ] test case
