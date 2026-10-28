# Lab 3

> RESTful API with Express Router + Mongoose, tested with Postman, documented with Swagger UI (OpenAPI 3.0).

## Exercises

| Type | Exercise | Topics | Entry point |
| --- | --- | --- | --- |
| In-class | Ex1 RESTful Product API | `routes/` `controllers/` `models/` split, product CRUD, category/min-max price filters, pagination | `inclass/lab3-api/server.js` |
| In-class | Ex1 extended (req 1, 2, 5, 7) | Category CRUD, name validation middleware, 400 vs 404 handling, pagination + sorting | `inclass/lab3-api/routes/category.routes.js` |
| In-class | Ex2 Swagger docs | `swagger-jsdoc` + `swagger-ui-express`, component schemas, reusable `IdPathParam` via `$ref`, Products/Categories tags | `inclass/lab3-api/config/swagger.js` |
| Homework | Orders & inventory API (MySQL) | not started | `homework/` |

## Run

```bash
cd lab3/inclass/lab3-api
npm install
npm run seed      # 10 products + 12 categories into shop_lab3_db
npm start         # http://localhost:3000
```

- API: <http://localhost:3000/api/products>, <http://localhost:3000/api/categories>
- Docs: <http://localhost:3000/api-docs>

## Notes

- MongoDB must listen on `127.0.0.1:27017`; database is `shop_lab3_db`.
- Run commands **from `lab3/inclass/lab3-api`**. Swagger scans `./routes/*.js` relative to the shell CWD, so starting from a parent folder yields an empty `/api-docs`.
- `npm run seed` wipes and repopulates both collections. Safe to re-run.
- Extended requirements done: Ex1 #1, #2, #5, #7; Ex2 #1–#4. Ex1 #6 (`PATCH /categories/:id` with `runValidators`) is present because #5 needs the update route.
- Ex2 #5 (Try it out in the browser) verified with equivalent HTTP calls; manual click-through still to do.
- Skipped on purpose: Ex1 #3 (auto-slug hook), Ex1 #4 (unique name/slug + 409), Ex2 #6 (Swagger screenshot for report).
- Full API reference: [`inclass/lab3-api/README.md`](./inclass/lab3-api/README.md).
