# Lab 5

> Process management with PM2, real-time updates with Socket.IO, and scheduled background jobs with node-cron.

## Exercises

| Type | Exercise | Topics | Entry point |
| --- | --- | --- | --- |
| In-class | Ex1 PM2 cluster | `ecosystem.config.js`, 4 workers, `/health` exposing `pid`/`uptime`, reload vs restart, crash recovery, pm2-logrotate, startup/save | `inclass/lab5-ex1/ecosystem.config.js` |
| In-class | Ex2 Socket.IO | JWT handshake auth, `products` room, `productUpdated` broadcast on `PUT /products/:id`, admin-only `newUserRegistered` notification | `homework/be/src/socket.js` |
| In-class | Ex3 node-cron | daily inventory report per category (aggregation: group/lookup/project/sort), hourly auto-archive of stale out-of-stock products, `status` field | `homework/be/src/jobs/` |
| Homework | Capstone extension | Orders (server-side total, own history, admin list/status), Google Sign-In, real-time `orderStatusUpdated` to the customer's room, Gmail order/status emails, daily revenue cron | `homework/be/src/server.js` |

## Run

The API used by all exercises is the shared ShopAdmin app in `lab5/homework/be`
(Lab 4 backend + Socket.IO + cron jobs):

```bash
cd lab5/homework/be
npm install
cp .env.example .env      # MongoDB URI + JWT secret (+ optional cron overrides)
npm run seed              # 3 categories + 6 products
npm start                 # http://localhost:4000/api/v1
```

Exercise 1 (PM2, 4 workers — this is the only one that runs in cluster mode):

```bash
cd lab5/inclass/lab5-ex1
npx pm2 start ecosystem.config.js
npx pm2 list
curl http://127.0.0.1:4000/health     # pid changes between 4 workers
npx pm2 monit                          # CPU/memory per worker
npx pm2 delete shop-api                # back to a single process
```

Exercise 2 (real-time): with the app running as **one process**, open
`lab5/homework/LAB5_HW_FE/index.html` with Live Server in two separate browsers
(normal + admin). Editing a product as admin updates the other browser without a refresh.
Terminal client: `cd lab5/inclass/lab5-ex2 && node test-client.js "<jwt>"`.

Exercise 3 (cron): the jobs start with the server. Fast demo without editing code:

```bash
INVENTORY_SCHEDULE='*/10 * * * * *' \
ARCHIVE_SCHEDULE='*/10 * * * * *' \
ARCHIVE_AFTER_MINUTES=0 npm start
# then set a product's quantity to 0 (PUT /api/v1/products/:id as admin)
```

Homework (orders, Google, email, revenue):

```bash
# .env: GOOGLE_CLIENT_ID, GMAIL_USER, GMAIL_APP_PASSWORD
# LAB5_HW_FE/config.js: GOOGLE_CLIENT_ID must be the same Client ID
REVENUE_SCHEDULE='* * * * *' npm start     # revenue job every minute for the demo
```

- `/orders`: cart → Place order (normal user), admin changes status in "All orders".
- The status change reaches the customer's browser live (`user:<id>` room) and sends an email.
- Google users are created on first sign-in; an existing email/password account resolves to the same user.

## Notes

- MongoDB must listen on `127.0.0.1:27017`; database `shopadmin_db`.
- **Socket.IO and cron need a single process.** Under PM2 cluster (`instances: 4`) rooms only reach clients on the same worker and every cron job runs 4 times. Use `instances: 1` (or `node src/server.js`) for Ex2, Ex3 and the homework.
- `/health` and `/dev/crash` exist only as Exercise 1 evidence; `/dev/crash` kills the worker that receives it.
- `ARCHIVE_AFTER_MINUTES` is the staleness window (`updatedAt`), not the schedule; production default is 1440 minutes (24h).
- `lab5/homework/LAB5_HW_FE/` is the provided frontend (Google button, cart/orders, socket client) and is not modified.
