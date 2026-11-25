# ShopAdmin – Web UI (provided)

This is the ready-made frontend for the Lab 4 homework. **Do not modify it** – your job is to build the backend it talks to.

## Run it

1. Start your backend.
2. Open `config.js` and make sure `API_BASE` points to it (default: `http://localhost:4000/api/v1`).
3. Open `index.html` with Live Server / Five Server (or just double-click it).
4. Open DevTools (`F12`) → **Network** tab and use the app. Every request the UI sends – method, URL,
   headers, JSON body – is visible there. That is your specification.

## Things to know

- **Every** logged-in user sees the Add / Edit / Delete buttons, including normal users. This is on purpose:
  the UI never decides what is allowed. Your backend must reject a normal user's changes with
  `403 Forbidden`, and the UI will show your error message in a red toast.
- After login the JWT is stored in `localStorage` under the key `token`
  (DevTools → Application → Local Storage) and sent on every request as
  `Authorization: Bearer <token>`.
- A `401` response on a protected request logs the user out automatically.
- Error toasts show the HTTP status and the `message` field from your JSON response, e.g.
  `{ "success": false, "message": "Forbidden: only admin users can perform this action." }`.
- Successful responses may be wrapped as `{ "success": true, "data": ... }` or returned bare.
- IDs may be named `id` (MySQL) or `_id` (MongoDB); a product's `categoryId` may be a plain id or a populated
  category object. The UI handles all of these.
- **Sign in with Google**: put your OAuth Client ID in `config.js` → `GOOGLE_CLIENT_ID` (the same value as in your
  backend `.env`). The page must be opened through Live Server (`http://127.0.0.1:5500`), not `file://`, and that
  origin must be listed under *Authorized JavaScript origins*. The button sends `POST /auth/google` with
  `{ "idToken": "<Google credential>" }` and expects the same `{ token, user }` response as `/auth/login`.
- **Orders page**: "Add to cart" on the Products page fills the cart; "Place order" sends
  `POST /orders` with `{ "items": [{ "productId", "quantity" }] }`. "My orders" loads `GET /orders/mine`.
  Admins also see "All orders" (`GET /orders`) and change a status with `PATCH /orders/:id/status` `{ "status" }`.
  `userId` in `GET /orders` may be a plain id or a populated `{ fullName, email }` object.
- **Real-time**: the page connects to Socket.IO at the API origin with `auth: { token }` and listens for
  `orderStatusUpdated` with a payload containing `orderId` and `status`. Use two different browsers
  (or a normal + a private window) for the customer and the admin — tabs of the same browser share `localStorage`.
- The avatar is uploaded as `multipart/form-data` with the field name `avatar`. `avatarUrl` may be an absolute
  URL (`http://localhost:4000/uploads/...`) or a path relative to the API server (`/uploads/...`).
