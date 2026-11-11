# Lab 4 · Exercise 3 — Calling an External API from the Backend with Axios

Layered Express backend (port 5001): `GET /api/v1/weather?city=...` calls the free Open-Meteo API (no key) with axios — first its geocoding endpoint (city → coordinates), then its forecast endpoint (current weather) — and returns a simplified JSON response. Third-party calls live on the server, never in client-side code.

## Run

```bash
cd lab4/inclass/lab4-ex3
npm install
node server.js          # backend on http://localhost:5001
```

Test: `http://localhost:5001/api/v1/weather?city=Ho Chi Minh`. One server at a time — exercises 1/2/3 share port 5001.

## Project structure (layering)

```
lab4-ex3/
├── services/weather.service.js      # external API calls only (axios, Open-Meteo)
├── controllers/weather.controller.js # HTTP concerns only (validation, status codes)
├── routes/weather.routes.js          # wiring
└── server.js                         # app setup + final error handler
```

## API

| Case | Status | Body |
| --- | --- | --- |
| Success | 200 | `{ success, data: { city, temperatureC, windSpeedKmh, observedAt } }` |
| Missing `city` | 400 | "The city query parameter is required" |
| Unknown city | 404 | `City "..." was not found` |
| External API timeout (`ECONNABORTED`) | 504 | "The weather service took too long to respond. Please try again." |
| Any other failure | 500 | "Could not get the weather right now" (generic error handler) |

## Extended requirements (Caching, Timeout & Resilience)

1. **In-memory cache** — `Map` keyed by city name, 5-minute TTL (`weather.service.js`). A repeated request within the window returns instantly without touching Open-Meteo.
2. **Timeout** — both external calls use `timeout: 5000`; the controller maps `error.code === 'ECONNABORTED'` to 504 with a friendly message. (Tip from the PDF: set the timeout to 1 ms to see it.)
3. **Timing log** — every external call logs its duration in ms per attempt, e.g. `Geocoding API took 1307ms (attempt 1)`; cache hits log `[cache] HIT for "Da Nang" (0s old)`.
4. **Retry once** — each external call is retried one more time on failure; a 404 from the external API is never retried (it would fail again). An unknown city therefore costs exactly one geocoding call.

## Notes

- The 404 for an unknown city is synthesized in the service: Open-Meteo's geocoding answers 200 with empty results.
- Network latency to Open-Meteo varies widely (0.8–7 s observed); the 5 s timeout plus retry absorbs most of it, and the cache removes repeat cost entirely.
