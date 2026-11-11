# Lab 4 · Exercise 1 — CORS & a Web UI Wired to a RESTful CRUD API

Express backend (port 5001) with CORS enabled, connected to a single-page Web UI (`index.html` + `app.js`) that calls it with the Fetch API from a different origin (e.g. Live Server on port 5500).

## Run

```bash
cd lab4/inclass/lab4-ex1
npm install
node server.js          # backend on http://localhost:5001
```

Open `index.html` with Live Server. One server at a time — exercises 1/2/3 share port 5001.

## API

| Method | Path | Behavior | Status codes |
| --- | --- | --- | --- |
| GET | `/api/v1/products` | List products; `?category=Electronics` filters (exact match); response also carries `categories` (distinct, always full) | 200 |
| POST | `/api/v1/products` | Create; name + price required | 201, 400 |
| PUT | `/api/v1/products/:id` | Update name/price/category | 200, 400 (invalid data), 404 (unknown id) |
| DELETE | `/api/v1/products/:id` | Remove | 200, 404 |

## UI features (extended requirements)

1. **Update flow** — Edit button turns the row into inputs with Save/Cancel; Save sends the PUT, Cancel re-renders.
2. **Category filter** — dropdown above the table, filled with the distinct categories; changing it re-fetches with `?category=...` (URL-encoded). New categories added via POST appear automatically.
3. **Visible errors** — red banner for every failed request, both network failures ("Failed to fetch") and HTTP errors (server's `message` shown); cleared on the next successful request.

## Notes

- Simulated in-memory database: all changes reset when the server restarts.
- `productsCache` in `app.js` backs the inline-edit row; each `<tr>` carries `data-id`.
- Error text is inserted with `textContent` (no HTML injection from server messages).
