# Lab 3 Homework — Orders & Inventory API (MySQL)

> Express + `mysql2/promise` orders API: atomic order creation, stock handling, JOIN queries, status state machine, analytics, Swagger docs.

## Setup

```bash
# 1. Start MySQL, then create schema + sample data (4 customers, 6 products, 4 orders)
mysql -u root -p < sql/schema.sql    # omit -p if root has no password; or: npm run db:init

# 2. Configure credentials (optional: defaults are 127.0.0.1:3306, root, no password)
cp .env.example .env

# 3. Install and run
npm install
npm start        # http://localhost:3001
```

- API base: `http://localhost:3001/api/v1`
- Docs: `http://localhost:3001/api-docs`
- DB: `ecommerce_order_db`

## Structure

```
server.js                  app setup, /api/v1 mounts, schema-less error mapping
config/db.js               pool + withTransaction() helper
config/swagger.js          OpenAPI definition + /api-docs
services/                  SQL + business rules (transactions, stock)
controllers/               request validation, HTTP responses
routes/                    Express routers + @swagger annotations
utils/                     httpError, parseInt id helper
sql/schema.sql             DDL + seed data
```

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/orders` | Validates `items` (non-empty, positive integers), 404 unknown customer/product, 400 out of stock, computes total from DB prices, inserts order + items, deducts stock — one transaction |
| GET | `/orders` | `status`, `customerId`, `page` (default 1), `limit` (default 5); JOIN customer, `SUM(quantity)`, `created_at` desc |
| GET | `/orders/:id` | Nested `customer` + `items[]` (`product_name`, `quantity`, `unit_price`, `subtotal`), 404 |
| PATCH | `/orders/:id/status` | ENUM check → 400; cancel restores stock once; cancelled order cannot change again → 400 |
| DELETE | `/orders/:id` | Restores stock first unless already cancelled; `order_items` removed by `ON DELETE CASCADE`; 404 |
| GET | `/orders/analytics/sales-summary` | `SUM`/`COUNT`/`AVG` on completed orders, top 3 products by quantity sold |
| GET | `/customers/:id/order-history` | Customer orders + `totalLifetimeSpent` on completed orders; 404 |

Route order matters: `/orders/analytics/sales-summary` is registered before `/orders/:id`.

## Example

```bash
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":2,"items":[{"productId":5,"quantity":2},{"productId":6,"quantity":1}]}'

curl "http://localhost:3001/api/v1/orders?status=completed&page=1&limit=5"
curl http://localhost:3001/api/v1/orders/analytics/sales-summary
curl http://localhost:3001/api/v1/customers/1/order-history
```

## Configuration

Optional `.env` (copy `.env.example`); `.env` is git-ignored. Values: `DB_HOST` (127.0.0.1), `DB_PORT` (3306), `DB_USER` (root), `DB_PASSWORD` (empty), `DB_NAME` (`ecommerce_order_db`), `PORT` (3001). Same keys work as plain environment variables, e.g. `DB_PORT=3307 npm start`; `.env` wins over defaults, exported variables win over `.env`.

## Behaviour notes

- **Transactions.** `withTransaction()` in `config/db.js` checks out a pooled connection, `BEGIN`s, `COMMIT`s on success, `ROLLBACK`s on any throw, and always `release()`s.
- **Row locks.** Order creation selects products with `FOR UPDATE`, so concurrent orders cannot oversell the last item.
- **Duplicate product lines.** The same `productId` twice in a payload is merged before the stock check, so `[{1,2},{1,2}]` needs 4 in stock, not 2.
- **Stock restored exactly once.** Cancel restores stock; deleting a cancelled order does not restore again. Deleting a pending/completed order restores first.
- **DECIMAL as numbers.** The pool sets `decimalNumbers: true`, so `price`, `total_amount` and `unit_price` arrive as JS numbers; totals still need rounding (`round2`).
- **Error mapping.** `httpError(status, message)` carries `err.status`; MySQL `ER_DUP_ENTRY` → 409, FK errors → 400.
- **Status values.** `pending`, `completed`, `cancelled`. Cancelled is terminal.

## Report

[`../LAB3_25560052.pdf`](../LAB3_25560052.pdf) holds the screenshot evidence for the homework, captured with Swagger **Try it out**.

Order of evidence: sales summary → filtered list → create order (201) → order detail → status change → customer history → out-of-stock 400 → Swagger UI. Values follow the seed in `sql/schema.sql`; reseed before re-running so ids stay `1`–`4` and the next created order is `5`.

## Manual step

Swagger "Try it out" needs a browser. Keep `PORT=3001`, because `config/swagger.js` pins the server to `http://localhost:3001/api/v1`; a different port makes Execute hit nothing.
