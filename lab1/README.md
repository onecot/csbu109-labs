# Lab 1

> MySQL DDL/DML + JOIN; Node.js + mysql2; MongoDB shell; Mongoose ODM.

## Exercises

| Type | Exercise | Topics | Entry point |
| --- | --- | --- | --- |
| In-class | SQL basics | DDL/DML, JOIN, aggregate on `ecommerce_db` | `inclass/inclass_exercise1_lab1.sql` |
| In-class | mysql2 demo | CRUD `categories`/`items`, filter, search, aggregate, JOIN | `inclass/inclass_exercises2_lab1b/mysql_demo.js` |
| In-class | Mongoose demo | Schema, validation, virtual, static/instance methods, middleware, soft-delete | `inclass/inclass_exercises3_lab1b/mongoose_demo.js` |
| Homework | SQL (library) | `library_db`: authors/books/borrow_records + JOIN | `homeworks/lab1_hw1/ddl_sql_script.sql` |
| Homework | Mongo shell | `blog_db.posts`: find, `$push`/`$inc`, aggregate | `homeworks/lab1_hw2/homework2_script.md` |
| Homework | SQL transaction | Ordering flow: balance/stock check, commit/rollback | `homeworks/lab1b_hw1/homework_sql_transaction.js` |
| Homework | Mongoose N-N | Student ↔ Course: enroll/drop, slots | `homeworks/lab1b_hw2/homework_many_to_many.js` |

## Run

```bash
cd lab1/<exercise_folder>   # folder containing package.json, e.g. inclass/inclass_exercises2_lab1b
npm install
cp .env.example .env   # set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME / MONGO_URI
node <file_name>.js
```

- `.sql` → run in a MySQL client; `.md` Mongo scripts → run in `mongosh`.

## Notes

- Each Node.js exercise has its own `package.json`; `node_modules/` + `.env` are ignored.
