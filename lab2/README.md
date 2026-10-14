# Lab 2

> ReactJS intro: Vite setup, components/props, useState/useEffect, fetch from DummyJSON API.

## Exercises

| Type | Exercise | Topics | Entry point |
| --- | --- | --- | --- |
| In-class | Ex1 components + props | Reusable `ProductCard` (name/price/inStock/image default), 3 sample products, red `Low price!` badge | `inclass/exercise1/src/App.jsx` |
| In-class | Ex2 list + cart (own data) | 7 products / 3 categories, search (case-insensitive) + category filter, cart qty/total/remove (`for...of`), `document.title`, `fakeFetchProducts` + `Loading...` | `inclass/exercise2/src/App.jsx` |
| In-class | Ex3 real API data | `services/productApi.js`, `GET /products?limit=12&skip=0` (title/price/thumbnail), Previous/Next (`skip=(page-1)*12`, disable via `total`), click → `GET /products/{id}` detail | `inclass/exercise3/src/App.jsx` |

## Run

```bash
cd lab2/inclass/<exercise>   # folder containing package.json, e.g. inclass/exercise1
npm install
npm run dev      # open http://localhost:5173
npm run lint     # eslint check
```

## Notes

- Each exercise has its own `package.json`; `node_modules/` is ignored.
- Ex2 uses local `src/data/products.js` (fake async); Ex3 uses live `https://dummyjson.com` (`total`: 194 products).
