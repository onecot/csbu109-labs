# ShopAdmin API — Lab 5

Express + MongoDB (Mongoose) + JWT backend for the provided `LAB5_HW_FE` UI, extended for Lab 5:
Socket.IO real-time updates and node-cron background jobs.

## Setup

```bash
npm install
cp .env.example .env      # then edit JWT_SECRET / MONGO_URI if needed
npm run seed              # 3 categories + 6 products (users are created in the UI)
npm start                 # http://localhost:4000/api/v1
```

Run it as **one process** (`node src/server.js`). PM2 cluster mode breaks Socket.IO rooms and
runs every cron job once per worker — use `instances: 1` outside Exercise 1.

MongoDB must be running locally (or set `MONGO_URI` to an Atlas connection string).

## Environment variables (`.env`)

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `4000` | HTTP port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/shopadmin_db` | MongoDB connection |
| `JWT_SECRET` | – | secret used to sign/verify tokens |
| `JWT_EXPIRES_IN` | `7d` | token lifetime |
| `INVENTORY_SCHEDULE` | `* * * * *` | inventory report cron (production: `0 0 * * *`) |
| `ARCHIVE_SCHEDULE` | `0 * * * *` | auto-archive cron |
| `ARCHIVE_AFTER_MINUTES` | `1440` | how stale (`updatedAt`) an out-of-stock product must be before archiving |

## Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/auth/register` | public |
| POST | `/api/v1/auth/login` | public |
| GET | `/api/v1/auth/me` | logged in |
| PUT | `/api/v1/users/me` | logged in (own profile) |
| POST | `/api/v1/users/me/avatar` | logged in (own avatar, `multipart/form-data`, field `avatar`) |
| GET | `/api/v1/categories` | logged in |
| GET | `/api/v1/products?categoryId=` | logged in |
| POST/PUT/DELETE | `/api/v1/categories`, `/api/v1/products` | **admin only** |
| GET | `/health` | public (Exercise 1: `pid`, `uptime`) |
| GET | `/dev/crash` | Exercise 1 evidence only: kills the handling worker |

Protected routes expect `Authorization: Bearer <token>`. Responses use
`{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "..." }`
with `400 / 401 / 403 / 404 / 409 / 413`.

## Socket.IO

- Connect to the API origin with `auth: { token }`; the handshake is rejected without a valid JWT.
- Every socket joins `user:<id>`; admins also join `admins`; clients join `products` via
  `products:join` / `products:leave`.
- `PUT /api/v1/products/:id` → `productUpdated { product, updatedBy }` to the `products` room.
- `POST /api/v1/auth/register` → `newUserRegistered { _id, fullName, email, type }` to admins only.

## Cron jobs

| Job | Schedule | What it does |
|---|---|---|
| `src/jobs/inventoryReport.js` | `INVENTORY_SCHEDULE` | aggregation per category → `category`, `totalProducts`, `totalQuantity`, `stockValue` (`price × quantity`), printed with `console.table` |
| `src/jobs/autoArchive.js` | `ARCHIVE_SCHEDULE` | archives products with `quantity: 0`, `updatedAt` older than `ARCHIVE_AFTER_MINUTES`, `status != 'archived'`; logs the count even when 0 |

Each job has its own `try/catch`, so one failing job never stops the other.

## Rules implemented

- Passwords hashed with bcrypt (10 rounds); `passwordHash` is never returned (`select: false` + `toJSON`).
- JWT payload: `{ id, type }`. `type` is `normal` or `admin`.
- No/invalid/expired token → `401`. Valid token but `type !== 'admin'` on write routes → `403`.
- Avatars: max 2MB, JPG/PNG/WEBP only, stored in `uploads/` and served from `/uploads/...`.
- `Product.status`: `active` (default) or `archived`.

## Structure

```
src/
├── app.js                  middleware, routes, /health, /dev/crash, 404 + error handler
├── server.js               connect DB, HTTP + Socket.IO, start cron jobs
├── socket.js               JWT handshake, rooms (user:<id>, admins, products)
├── config/db.js
├── models/                 user, category, product (with status)
├── controllers/            auth, user, category, product
├── middleware/             auth (401), admin (403), upload (multer)
├── routes/
├── jobs/                   inventoryReport, autoArchive
└── seed.js
```
