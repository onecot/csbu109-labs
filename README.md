# CSBU109 — Database and Web Application Development | Labs

> Lab exercises for CSBU109.

## Student Info

| | |
| --- | --- |
| Name | Lê Minh Tân |
| ID | 25560052 |
| Term | 3rd |
| Class | CSBU109.R11.KHBC |
| Lecturer | Nguyen Thanh Binh, Nguyen Phan Thao Duyen |

## Labs

| Lab | Topics |
| --- | --- |
| [lab1/](./lab1/) | MySQL DDL/DML + JOIN; mysql2 CRUD; Mongo shell agg; Mongoose validation/middleware/N-N |
| [lab2/](./lab2/) | React + Vite: intro (props/state/effect), shop/cart (own data), DummyJSON API Blog (list/search/detail/add/delete) |
| [lab3/](./lab3/) | Express Router + Mongoose REST API (CRUD, filters, pagination), Swagger UI / OpenAPI 3.0 docs; homework orders API on MySQL (transactions, JOINs, analytics) |
| [lab4/](./lab4/) | CORS + Fetch UI on a CRUD API (update, category filter, error banner); Multer upload/download/delete + file gallery; Axios external API (Open-Meteo weather) with cache, timeout and retry; DevTools debugging of 10 planted API bugs; homework: ShopAdmin backend with bcrypt + JWT + role-based 401/403 |
| [lab5/](./lab5/) | PM2 cluster mode (load balancing, crash recovery, logrotate); Socket.IO real-time product updates with JWT handshake + rooms; node-cron inventory report and auto-archive jobs |

## Prerequisites

MySQL, MongoDB, Node.js (`mysql2`, `mongoose`, `dotenv`); Node 20.19+ / 22.12+ + Vite for lab2 React apps. Lab3 adds Express 5, `swagger-jsdoc` and `swagger-ui-express`. Lab4 adds `cors`, `multer`, `axios`, plus `bcryptjs` and `jsonwebtoken` for the homework backend. Lab5 adds `socket.io` (client for test scripts) and `node-cron`, plus PM2 for process management.

## Getting Started

Per-exercise `npm install`, config `.env`, `node <file>.js`; `.sql` files run in a MySQL client.

React (lab2): `cd lab2/inclass/<exercise>` or `lab2/homework/blog-ui` && `npm install` && `npm run dev` (`npm run lint` to check).

API (lab3): `cd lab3/inclass/lab3-api` && `npm install` && `npm run seed` && `npm start`; API on `http://localhost:3000`, docs on `/api-docs`.

API (lab4 homework): `cd lab4/homework/be` && `npm install` && `cp .env.example .env` && `npm run seed` && `npm start`; API on `http://localhost:4000/api/v1`, then open `lab4/homework/LAB4_HW_FE/index.html` with Live Server.

API (lab5): `cd lab5/homework/be` && `npm install` && `cp .env.example .env` && `npm run seed` && `npm start`; run it as a single process for Socket.IO + cron. PM2 cluster demo: `cd lab5/inclass/lab5-ex1` && `npx pm2 start ecosystem.config.js`.

## Notes

- `node_modules/` + `.env` are git-ignored; report PDF/DOCX stays with each exercise.
