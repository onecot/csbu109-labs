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
| `GOOGLE_CLIENT_ID` | – | OAuth Client ID used to verify Google ID tokens (same value in `LAB5_HW_FE/config.js`) |
| `GMAIL_USER` | – | Gmail address used as the sender |
| `GMAIL_APP_PASSWORD` | – | 16-character App Password (2-Step Verification required) |
| `REVENUE_SCHEDULE` | `0 0 * * *` | daily revenue cron (use `* * * * *` for the demo) |

## Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/auth/register` | public |
| POST | `/api/v1/auth/login` | public |
| POST | `/api/v1/auth/google` | public (body: `{ idToken }`) |
| GET | `/api/v1/auth/me` | logged in |
| PUT | `/api/v1/users/me` | logged in (own profile) |
| POST | `/api/v1/users/me/avatar` | logged in (own avatar, `multipart/form-data`, field `avatar`) |
| GET | `/api/v1/categories` | logged in |
| GET | `/api/v1/products?categoryId=` | logged in |
| POST/PUT/DELETE | `/api/v1/categories`, `/api/v1/products` | **admin only** |
| POST | `/api/v1/orders` | logged in (`items: [{ productId, quantity }]`) |
| GET | `/api/v1/orders/mine` | logged in (own orders) |
| GET | `/api/v1/orders` | **admin only** (userId populated with name/email) |
| PATCH | `/api/v1/orders/:id/status` | **admin only** (`{ status }`) |
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
- `PATCH /api/v1/orders/:id/status` → `orderStatusUpdated { orderId, status }` to `user:<order.userId>`.

## Email

`POST /orders` sends an order confirmation and `PATCH /orders/:id/status` sends a status update
through Gmail SMTP (`GMAIL_USER` + `GMAIL_APP_PASSWORD`). If the two variables are missing, the mail
is skipped with a `[EMAIL] ... skipped` warning so development keeps working.

## Cron jobs

| Job | Schedule | What it does |
|---|---|---|
| `src/jobs/inventoryReport.js` | `INVENTORY_SCHEDULE` | aggregation per category → `category`, `totalProducts`, `totalQuantity`, `stockValue` (`price × quantity`), printed with `console.table` |
| `src/jobs/autoArchive.js` | `ARCHIVE_SCHEDULE` | archives products with `quantity: 0`, `updatedAt` older than `ARCHIVE_AFTER_MINUTES`, `status != 'archived'`; logs the count even when 0 |
| `src/jobs/dailyRevenueReport.js` | `REVENUE_SCHEDULE` | previous calendar day's **completed** orders: count + summed `totalAmount` |

Each job has its own `try/catch`, so one failing job never stops the other.

## Rules implemented

- Passwords hashed with bcrypt (10 rounds); `passwordHash` is never returned (`select: false` + `toJSON`).
- JWT payload: `{ id, type }`. `type` is `normal` or `admin`.
- No/invalid/expired token → `401`. Valid token but `type !== 'admin'` on write routes → `403`.
- Avatars: max 2MB, JPG/PNG/WEBP only, stored in `uploads/` and served from `/uploads/...`.
- `Product.status`: `active` (default) or `archived`.
- Google Sign-In users have no `passwordHash`; an existing email/password account logs in as the same user.
- Orders: `items` store a snapshot (`productId`, `name`, `price`, `quantity`) and `totalAmount` is always computed from database prices.

## Structure

```
src/
├── app.js                  middleware, routes, /health, /dev/crash, 404 + error handler
├── server.js               connect DB, HTTP + Socket.IO, start cron jobs
├── socket.js               JWT handshake, rooms (user:<id>, admins, products)
├── config/db.js
├── models/                 user, category, product (with status), order
├── controllers/            auth (register/login/google), user, category, product, order
├── middleware/             auth (401), admin (403), upload (multer)
├── routes/
├── services/email.service.js   Gmail SMTP (order + status emails)
├── jobs/                   inventoryReport, autoArchive, dailyRevenueReport
└── seed.js
```
