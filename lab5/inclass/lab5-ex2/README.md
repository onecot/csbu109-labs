# Lab 5 · Exercise 2 — Real-Time Product Updates with Socket.IO

Server code lives in the shared Lab 5 app: [`../../homework/be`](../../homework/be)
(Socket.IO added on top of the Lab 4 ShopAdmin API).

## What changed

| File | Change |
|---|---|
| `src/socket.js` | `initSocket(httpServer)`: JWT handshake auth (`io.use`), private `user:<id>` room, `products` room via `products:join` / `products:leave` |
| `src/server.js` | `http.createServer(app)` + `initSocket(httpServer)` + `app.set('io', io)` |
| `src/controllers/product.controller.js` | after `PUT /api/v1/products/:id`, `io.to('products').emit('productUpdated', { product, updatedBy })` |

## Extended requirement (admin broadcast)

Implemented:

1. `src/socket.js` — an admin socket joins the shared room `admins` on connect (`if (socket.userType === 'admin')`), so normal users are never in it.
2. `src/controllers/auth.controller.js` — after a successful `POST /auth/register`, the server emits `newUserRegistered` with `{ _id, fullName, email, type }` to `ADMINS_ROOM` only.
3. Live / Reconnecting… / Offline indicator and the reconnect handling (`reconnect_attempt`, `reconnect` → re-fetch lists, re-join products) are already in the provided UI (`app.js` → `connectSocket`), so no client change was needed.

Test: connect `test-client.js` with an **admin** token and again with a **normal** token, then register a new account. Only the admin client prints `newUserRegistered`.

## Run

```bash
cd lab5/homework/be
npm install
npm start                       # HTTP + Socket.IO on port 4000 (single process!)

# small terminal client that behaves like the UI
cd lab5/inclass/lab5-ex2
npm install
node test-client.js "<normal-user-jwt>"
```

In another terminal, log in as an **admin** and update a product
(`PUT /api/v1/products/:id` with `{ "quantity": 42 }`). The client prints the
`productUpdated` event without any refresh. An invalid/expired token makes the
handshake fail with `Authentication failed` (401-style connection error).

The same client also prints `newUserRegistered` (admins only) and
`orderStatusUpdated` (own orders only) — used by the Lab 5 homework.

## Notes

- Socket.IO must run as **one process**. Under PM2 cluster (`instances: 4`) the
  handshake can land on a worker that does not hold the other clients, so
  `io.to(room).emit()` reaches only some users. Run `node src/server.js` or
  `instances: 1` for Exercises 2/3 and the homework.
- The provided UI (`lab5/homework/LAB5_HW_FE`) already contains the client code:
  it connects with `auth: { token }`, emits `products:join` when the Products page
  opens, and listens for `productUpdated`.
