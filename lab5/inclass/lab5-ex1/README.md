# Lab 5 · Exercise 1 — PM2 Cluster Mode

Runs the shared ShopAdmin app (`../../homework/be/src/server.js`) under PM2 in cluster mode.

## Run

```bash
npm install              # installs pm2 locally (or: npm i -g pm2)
npx pm2 start ecosystem.config.js
npx pm2 list             # 4 online workers, mode "cluster"
```

Prove the load balancer splits requests:

```bash
for i in $(seq 1 8); do curl -s localhost:4000/health; echo; done
# pid changes between 4 different values
```

## Evidence collected

| Requirement | How |
| --- | --- |
| Cluster mode / load balancing | 10 requests → 4 different `pid` values in `/health` |
| `pm2 monit` | run while sending `seq 1 3000 \| xargs -P 32 -I{} curl -s -o /dev/null localhost:4000/health` |
| Crash recovery | `GET /dev/crash` → `process.exit(1)`; only that pid is replaced, the other 3 keep their pids |
| Reload without downtime | `npx pm2 reload shop-api` (replaces workers one by one) |
| Log rotation | `npx pm2 install pm2-logrotate`; `npx pm2 conf pm2-logrotate` → 10MB, keep 30 files, daily 00:00 |
| Start on boot | `npx pm2 startup` (run the printed sudo command) + `npx pm2 save` → `~/.pm2/dump.pm2` |

## Notes

- `pm2 save` must be run **after** the app list is correct: `pm2 delete shop-api && pm2 save` leaves an empty dump, so a later boot starts PM2 with no apps.
- `pm2 startup` on macOS writes `~/Library/LaunchAgents/pm2.<user>.plist` and runs `pm2 resurrect` once at login. It is a one-shot, not a watchdog.
- Cluster mode is for Exercise 1 only. Socket.IO (Ex2) and cron (Ex3) need one process, otherwise events only reach the same worker and jobs run once per worker.
