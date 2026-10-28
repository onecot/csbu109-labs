# Lab 3 API — Products & Categories

> Express 5 + Mongoose 9 REST API with layered architecture (routes → controllers → models), seeded sample data, and Swagger UI docs.

## Quick start

```bash
cd lab3/inclass/lab3-api
npm install
npm run seed     # reset DB to 10 products + 12 categories
npm start        # http://localhost:3000
```

Requires MongoDB on `127.0.0.1:27017`. Database: `shop_lab3_db` (created on first write).

| URL | Purpose |
| --- | --- |
| `http://localhost:3000/api/products` | Product endpoints |
| `http://localhost:3000/api/categories` | Category endpoints |
| `http://localhost:3000/api-docs` | Swagger UI (OpenAPI 3.0) |

## Scripts

| Command | Action |
| --- | --- |
| `npm start` | Run `server.js` on port 3000 |
| `npm run seed` | Delete and re-insert sample products + categories |
| `npm test` | Not configured (prints "no test specified", exits 1) |

## Structure

```
server.js                     app setup, JSON parser, Swagger mount, route mounts, global error handler
config/swagger.js             OpenAPI definition + /api-docs
models/                       Mongoose schemas (Product, Category)
controllers/                  request handlers (CRUD, filters, pagination)
routes/                       Express routers + @swagger annotations
middleware/                   category.validation.js (name rule)
seed.js                       sample data
```

## Models

| Model | Fields | Rules |
| --- | --- | --- |
| `Product` | `name`, `category`, `price`, `stock`, `description` | `name`/`category`/`price` required; `category` enum `Electronics`/`Audio`/`Accessories`; `price >= 0`; `stock` default `0`; `timestamps` |
| `Category` | `name`, `slug`, `description` | `name`/`slug` required; `trim`; `timestamps` |

No unique indexes on either model, so the error handler's `409` branch (`err.code === 11000`) is not reachable yet.

## Endpoints

### Products

| Method | Path | Success | Notes |
| --- | --- | --- | --- |
| GET | `/api/products` | 200 | Filters: `category`, `minPrice`, `maxPrice`. Paging: `page` (default 1), `limit` (default 5). Sort `createdAt` desc |
| POST | `/api/products` | 201 | Body: `name`, `category`, `price` required |
| GET | `/api/products/:id` | 200 | 404 unknown id, 400 malformed id |
| PUT | `/api/products/:id` | 200 | Partial update (`findByIdAndUpdate`, `new`, `runValidators`) |
| DELETE | `/api/products/:id` | 200 | 404 unknown id |

List response:

```json
{
  "success": true,
  "count": 5,
  "pagination": { "currentPage": 1, "totalPages": 2, "totalProducts": 10 },
  "data": []
}
```

### Categories

| Method | Path | Success | Notes |
| --- | --- | --- | --- |
| GET | `/api/categories` | 200 | `page` (default 1), `limit` (default 5). Sort `createdAt` desc, `_id` desc tiebreaker |
| POST | `/api/categories` | 201 | `name` (≥ 3 chars, middleware), `slug` required |
| GET | `/api/categories/:id` | 200 | 404 unknown id, 400 malformed id |
| PATCH | `/api/categories/:id` | 200 | Partial update; `name` validated only when present |
| DELETE | `/api/categories/:id` | 200 | 404 unknown id |

List response:

```json
{
  "success": true,
  "count": 5,
  "pagination": { "currentPage": 1, "totalPages": 3, "totalCategories": 12 },
  "data": []
}
```

### Examples

```bash
curl http://localhost:3000/api/categories?page=2&limit=5
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Pet Supplies","slug":"pet-supplies","description":"Food and toys"}'
curl -X PATCH http://localhost:3000/api/categories/<id> \
  -H "Content-Type: application/json" -d '{"description":"Updated"}'
```

## Error mapping

Global handler in `server.js`, registered after the routes:

| Condition | Status | Body key |
| --- | --- | --- |
| `ValidationError` | 400 | `error` |
| `CastError` (malformed ObjectId) | 400 | `error` |
| duplicate key `11000` | 409 | `error` (unused, no unique indexes) |
| error with `err.status` (e.g. malformed JSON body) | that status (400) | `error` |
| unexpected errors | 500 | `error` |

Handlers return `404` explicitly when a well-formed id matches no document. Validation middleware short-circuits with `400` before the controller runs.

## Swagger

`config/swagger.js` scans `./routes/*.js` for `@swagger` blocks. Spec is built **once at server start** — restart after editing annotations.

- Tags: `Products`, `Categories`
- Component schemas: `Product`, `Category`
- Reusable path param: `components.parameters.IdPathParam`, referenced by `$ref` on every `{id}` route
- Server base URL: `http://localhost:3000/api`

## Postman checklist

After `npm run seed` and `npm start` (counts assume freshly seeded data):

1. `GET /api/categories` → 200, `count: 5`, `totalPages: 3`
2. `GET /api/categories?page=2&limit=5` → 200, different documents
3. `POST /api/categories` valid body → 201 (copy `data._id`)
4. `PATCH /api/categories/<id>` `{"description":"..."}` → 200
5. `DELETE /api/categories/<id>` → 200
6. `POST /api/categories` `{"name":"AB","slug":"ab"}` → 400 (middleware)
7. `GET /api/categories/not-an-id` → 400 (`CastError`)
8. `GET /api/categories/6ae1b198d816a0d72ad4e1ff` → 404 (absent, well-formed id)

## Gotchas

- **Start from this folder.** `apis: ['./routes/*.js']` is CWD-relative; launching from `lab3/` gives empty docs.
- **Restart after annotation edits.** The spec is compiled at require time.
- **Stale process.** If an old `node server.js` still holds port 3000, requests hit old code. `pkill -f "node server.js"` then restart.
- **`new: true` warning.** Mongoose 9 logs a deprecation hint for `findOneAndUpdate`; replace with `returnDocument: 'after'` to silence it (lab sheet uses `new: true`).
- **Product pagination tiebreaker.** `/api/products` sorts on `createdAt` only. Seeded rows can share a millisecond, so page order is not guaranteed stable; categories already sort on `{ createdAt: -1, _id: -1 }`.
