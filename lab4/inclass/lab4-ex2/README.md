# Lab 4 · Exercise 2 — Uploading & Downloading Files with Multer

Express backend (port 5001) that receives an image as `multipart/form-data`, stores it in `uploads/` with Multer (disk storage), serves the folder as static files, and offers list / download / delete endpoints. The Web UI (`upload.html`, opened via Live Server) uploads with the Fetch API and shows a gallery of all stored files.

## Run

```bash
cd lab4/inclass/lab4-ex2
npm install
node upload_server.js   # backend on http://localhost:5001
```

Open `upload.html` with Live Server. One server at a time — exercises 1/2/3 share port 5001.

## API

| Method | Path | Behavior | Status codes |
| --- | --- | --- | --- |
| POST | `/api/v1/upload-avatar` | Single file, form field `avatar`; JPG/PNG/WEBP only; max 2 MB | 200 + `fileInfo` (filename, size, mimetype, public URL), 400 (wrong type / too large / no file) |
| GET | `/api/v1/files` | Every file in `uploads/`: name, size, view URL, download URL | 200 |
| GET | `/api/v1/download/:filename` | `res.download()` → browser shows "Save As" instead of inline preview | 200, 404 |
| DELETE | `/api/v1/files/:filename` | Removes the file with `fs.unlink` | 200, 404 |

Static serving: `/uploads/<filename>` opens the image inline (`express.static`).

## Web UI (extended requirements)

- Drag-and-drop / file picker upload, preview + public URL on success.
- **Gallery** (Figure 2.6 style): card grid below the upload card — square thumbnail, truncated filename, size in KB, header with file count; each card has **Download** (forces Save As) and **Delete** (confirm, then re-render). Refreshes after every upload and delete.

## Security & error handling

- `path.basename(req.params.filename)` before joining with the uploads folder on both download and delete routes — a name like `../server.js` cannot reach files outside `uploads/`.
- A dedicated error middleware turns Multer errors (`LIMIT_FILE_SIZE`, rejected file types) into JSON responses instead of Express's default HTML error page.
- `uploads/` is created on startup with `fs.mkdirSync(..., { recursive: true })`.
