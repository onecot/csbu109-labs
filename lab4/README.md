# Lab 4

> Same-Origin Policy & CORS, Fetch API from another origin, Multer file uploads, calling an external API with axios (cache/timeout/retry), debugging API bugs with DevTools, and a JWT-protected backend.

## Exercises

| Type | Exercise | Topics | Entry point |
| --- | --- | --- | --- |
| In-class | Ex1 CORS + Web UI | Express on port 5001, `cors()` + preflight, Fetch CRUD from Live Server, category filter, error banner | `inclass/lab4-ex1/server.js` |
| In-class | Ex2 Multer uploads | disk storage, `multipart/form-data`, static `/uploads`, list/download/delete gallery | `inclass/lab4-ex2/upload_server.js` |
| In-class | Ex3 External API | layered backend, axios → Open-Meteo (geocoding + forecast), in-memory cache with TTL, `ECONNABORTED` → 504, timing logs, retry | `inclass/lab4-ex3/server.js` |
| In-class | Ex4 DevTools debugging | 10 planted backend bugs fixed from Console/Network evidence (CORS origin + methods, `express.json()`, wrong DTO key, missing response, swapped stats, missing `return`, id type mismatch, falsy `done`, `splice` index) | `inclass/lab4-ex4/be/server.js` |
| Homework | ShopAdmin backend | Mongo models (User/Category/Product), REST API for the provided UI, bcrypt + JWT, Multer avatar, server-side role check (401/403) | `homework/be/src/server.js` |

## Run

In-class exercises (each in its own folder):

```bash
cd lab4/inclass/lab4-ex1   # port 5001
npm install && npm start
# open index.html with Live Server (127.0.0.1:5500)
```

- Ex2: `cd lab4/inclass/lab4-ex2 && npm install && npm start`, open `upload.html`
- Ex3: `cd lab4/inclass/lab4-ex3 && npm install && npm start`, `GET /api/v1/weather?city=Hanoi`
- Ex4: `cd lab4/inclass/lab4-ex4/be && npm install && npm start` (port 5002), open `fe/index.html`

Homework backend (port 4000):

```bash
cd lab4/homework/be
npm install
cp .env.example .env    # JWT_SECRET, MONGO_URI
npm run seed            # 3 categories + 6 products
npm start               # http://localhost:4000/api/v1
```

Then open `lab4/homework/LAB4_HW_FE/index.html` with Live Server and register an account
(choose `admin` to test write routes). Full API reference: [`homework/be/README.md`](./homework/be/README.md).

## Notes

- MongoDB must listen on `127.0.0.1:27017`; homework database is `shopadmin_db`.
- `npm run seed` wipes and repopulates categories + products only; users are created through the UI.
- Homework rules: JWT payload `{ id, type }`, bcrypt 10 rounds, `passwordHash` never returned, missing/invalid token → 401, non-admin write → 403, avatar ≤ 2MB (jpg/png/webp) saved in `uploads/`.
- `lab4/homework/LAB4_HW_FE/` is the provided frontend and is not modified.
- Report: [`LAB4_25560052.pdf`](./LAB4_25560052.pdf) (in-class bug list + homework).
