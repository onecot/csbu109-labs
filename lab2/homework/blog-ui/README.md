# Mini Blog Manager

> Lab 2 homework (CSBU109): React SPA managing blog posts from `https://dummyjson.com/posts`.

## Features

| Requirement | Implemented in |
| --- | --- |
| List: 10 posts/page (`title`, `tags`, likes), Previous/Next, loading + error | `src/pages/PostsPage.jsx` |
| Search: 400 ms debounce via custom hook, `GET /posts/search` | `src/hooks/useDebounce.js` |
| Detail: full body + comments (`GET /posts/{id}`, `GET /posts/{id}/comments`) | `src/pages/PostDetailPage.jsx` |
| Add: form (title, body required), `POST /posts/add`, prepends server result | `src/components/PostForm.jsx` |
| Delete: confirmation, `DELETE /posts/{id}`, removes by server-returned id | `src/pages/PostsPage.jsx` |

## Structure

```
src/
├── components/  PostCard.jsx, PostForm.jsx          (reusable UI, report via callback props)
├── pages/       PostsPage.jsx, PostDetailPage.jsx   (screens: list+search+add, detail)
├── hooks/       useDebounce.js                      (timer + clearTimeout cleanup)
├── services/    postApi.js                          (all URLs/headers live here)
└── App.jsx      renders PostsPage
```

## Run

```bash
cd lab2/homework/blog-ui
npm install
npm run dev      # http://localhost:5173
npm run lint     # eslint check
```

## Notes

- API data is not persisted by DummyJSON: a new post disappears on reload/paging (expected).
- `POST /posts/add` returns fewer fields than the list — defaults (`tags`, `reactions`, `views`) are merged on add.
- 251 posts total; page 1 example: `GET /posts?limit=10&skip=0`.
- Stale requests are cancelled with `AbortController` in the list effect.
