# ShopAdmin API — Lab 4 homework backend

Express + MongoDB (Mongoose) + JWT backend for the provided `LAB4_HW_FE` UI.

## Setup

```bash
npm install
cp .env.example .env      # then edit JWT_SECRET / MONGO_URI if needed
npm run seed              # optional: 3 categories + 6 products
npm start                 # http://localhost:4000/api/v1
```

MongoDB must be running locally (or set `MONGO_URI` to your Atlas connection string).

`npm run seed` resets categories and products only; user accounts are created through the UI.

Point the UI at the API in `../LAB4_HW_FE/config.js` (`API_BASE`), then open `index.html` with
Live Server and register an account. Choose `admin` as the account type to be able to write.

## Environment variables (`.env`)

| Variable | Meaning |
|---|---|
| `PORT` | HTTP port, default `4000` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | secret used to sign/verify tokens |
| `JWT_EXPIRES_IN` | token lifetime, default `7d` |

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

Protected routes expect `Authorization: Bearer <token>`. Responses use
`{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "..." }`
with `400 / 401 / 403 / 404 / 409 / 413`.

## Rules implemented

- Passwords hashed with bcrypt (10 rounds); `passwordHash` is never returned (`select: false` + `toJSON`).
- JWT payload: `{ id, type }`. `type` is `normal` or `admin`.
- No/invalid/expired token → `401`. Valid token but `type !== 'admin'` on write routes → `403`.
- Avatars: max 2MB, JPG/PNG/WEBP only, stored in `uploads/` and served from `/uploads/...`.

## Structure

```
src/
├── app.js                  middleware, routes, 404 + error handler
├── server.js               connect DB, start server
├── config/db.js
├── models/                 user, category, product
├── controllers/            auth, user, category, product
├── middleware/             auth (401), admin (403), upload (multer)
├── routes/
└── seed.js
```
