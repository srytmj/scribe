# TASK-011: Chapter CRUD — Editor Blog-Style + Autosave + Status

Status: Open
Priority: High
Created: 2026-07-23 20:00
Request: Translator dashboard untuk create/edit/delete chapter: chapter_number (decimal 8,1), title (nullable), content via Tiptap editor mirip blog (support sisip gambar di tengah teks), volume_id (opsional), status (draft/on_revision/published). Autosave berkala saat translator mengetik (endpoint PATCH .../chapters/{id}/autosave, update content + last_autosaved_at tanpa ubah status). Validasi UNIQUE(novel_id, volume_id, chapter_number). Chapter berstatus draft atau on_revision tidak boleh diakses reader.

Termasuk: endpoint upload gambar inline untuk Tiptap (mis. `POST /dashboard/chapters/{id}/images`), simpan ke local disk terpisah dari cover (`storage/app/public/chapter-images/`), kembalikan URL untuk disisipkan editor. Validasi tipe file & ukuran max sama seperti cover image.

---

## DEV Response
[DEV fills this]

- [ ] subtask

---

## QA Response
[QA fills this]

- [ ] test case
