# ORACLEX MAIL ENGINE

A production-grade, developer-first transactional email infrastructure platform. Rotation-based SMTP delivery, async queue processing, built-in template engine, and daily capacity reset.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000 / 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `psql "$DATABASE_URL" -f seed.sql` — re-seed test data
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- SMTP: Nodemailer (Gmail STARTTLS port 587)
- Queue: In-process async queue with exponential backoff retry
- Cron: node-cron (daily SMTP pool reset at 00:00 UTC)
- Validation: Zod, `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (developers, smtp_pool, email_logs)
- `artifacts/api-server/src/services/templateEngine.ts` — 6 built-in HTML email templates
- `artifacts/api-server/src/services/smtpService.ts` — Gmail rotation + delivery logic
- `artifacts/api-server/src/services/emailQueue.ts` — async queue processor with retry
- `artifacts/api-server/src/services/cronService.ts` — daily SMTP pool reset cron
- `artifacts/api-server/src/middlewares/auth.ts` — Bearer API key middleware
- `artifacts/api-server/src/routes/v1/` — v1 route handlers (email, smtp, stats)
- `README.md` — full curl examples and setup guide

## Architecture decisions

- Never block the API request: `POST /v1/email/send` writes a `queued` log, returns HTTP 202, and hands off to an in-process async queue — SMTP delivery never happens in-band.
- SMTP rotation uses LRU + capacity: `SELECT … ORDER BY last_used_timestamp ASC LIMIT 1` ensures even distribution and graceful failover.
- On SMTP failure, the node is marked `rate_limited` or `locked` and the error is re-thrown, causing the queue to retry with the next healthy node (up to 3x, exponential backoff).
- Daily cron at 00:00 UTC resets `daily_sent_count = 0` for all non-locked nodes and reactivates `rate_limited` ones — equivalent to Cloudflare Cron Trigger.
- All HTML templates use `{{variable}}` syntax compiled at send time with data from the API request payload.

## Product

- `POST /api/v1/email/send` — queue a transactional email (6 templates: verification, otp, password-reset, magic-link, security-alert, welcome-email)
- `GET /api/v1/email/logs` — paginated email delivery log with status filter
- `GET /api/v1/email/logs/:id` — individual log detail
- `GET /api/v1/smtp/pool` — SMTP node status and capacity
- `GET /api/v1/stats` — aggregate delivery stats per developer

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Gmail App Passwords required — not account passwords. Enable 2FA, then generate at myaccount.google.com/apppasswords.
- `pnpm run typecheck:libs` must pass before leaf artifact typechecks work (lib declarations must be fresh).
- The api-server builds to `dist/` via esbuild — changes require a workflow restart to take effect.
- `lib/api-zod/src/index.ts` only exports from `./generated/api` (Zod schemas) — the `./generated/types` barrel was removed to avoid naming conflicts.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `README.md` for full curl examples using the seed test key `oraclex_live_test_key_xyz123`
