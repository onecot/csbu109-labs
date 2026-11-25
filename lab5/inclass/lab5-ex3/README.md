# Lab 5 · Exercise 3 — Scheduled Background Jobs with node-cron

Server code lives in the shared Lab 5 app: [`../../homework/be`](../../homework/be).

## What was added

| File | Purpose |
|---|---|
| `src/jobs/inventoryReport.js` | every minute: aggregation per category → `category`, `totalProducts`, `totalQuantity`, `stockValue` (`price × quantity`), printed with `console.table` |
| `src/jobs/autoArchive.js` | hourly: sets `status: 'archived'` on products with `quantity: 0`, `updatedAt` older than 24h, `status != 'archived'`; logs the count even when 0 |
| `src/models/product.model.js` | `status: 'active' | 'archived'`, default `active` |
| `src/server.js` | starts both jobs after MongoDB connects |

Each job has its own `try/catch`, so a failing inventory report never stops auto-archive.

## Run

```bash
cd lab5/homework/be
npm install
npm start                 # single process! every worker would run its own copy of each job
```

For a fast demo (no code edit, override by env):

```bash
INVENTORY_SCHEDULE='*/10 * * * * *' \
ARCHIVE_SCHEDULE='*/10 * * * * *' \
ARCHIVE_AFTER_MINUTES=2 npm start
```

Then set a product's quantity to 0 with `PUT /api/v1/products/:id` (admin token); it flips to `archived` after the 2-minute window, and the terminal prints:

```
[CRON] Running inventory report at ...
[CRON] Inventory by category:
┌─────────────┬───────────────┬───────────────┬────────────┐
│ category    │ totalProducts │ totalQuantity │ stockValue │
...
[CRON] Auto-archive: 1 product(s) archived
```

## Notes

- In production the inventory job is `0 0 * * *` (midnight) and archive `0 * * * *` (hourly); both defaults are in the job files.
- PM2 cluster duplicates cron jobs (4 workers = 4 runs). Keep `instances: 1`, or guard with `process.env.NODE_APP_INSTANCE === '0'`.
