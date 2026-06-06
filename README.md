# ORACLEX MAIL ENGINE

A production-grade transactional email infrastructure platform. Developer-first, rotation-based SMTP delivery with built-in template engine, async queue processing, and daily capacity reset.

## Architecture

```
POST /api/v1/email/send
        │
        ▼
  [Auth Middleware]  ← Bearer <API_KEY> validated against developers table
        │
        ▼
  [Write email_logs]  ← status: "queued", messageId returned instantly (HTTP 202)
        │
        ▼
  [In-process Queue]  ← async, non-blocking
        │
        ▼
  [Template Engine]   ← renders HTML layout with {{variable}} substitution
        │
        ▼
  [SMTP Rotation]     ← SELECT optimal Gmail node (active, capacity remaining, LRU)
        │
        ▼
  [Nodemailer SMTP]   ← Gmail STARTTLS, From: "Sender via ORACLEX" <relay@gmail.com>
        │
   ┌────┴────┐
   ▼         ▼
 sent    failed/rate_limited
   │         │
update log  lock node + retry (up to 3x exponential backoff)
```

**Daily Reset Cron** — runs at 00:00 UTC: resets `daily_sent_count = 0` for all non-locked nodes, reactivates `rate_limited` nodes.

## Stack

- **Runtime:** Node.js 24, TypeScript 5.9, Express 5
- **DB:** PostgreSQL + Drizzle ORM
- **SMTP:** Nodemailer (Gmail STARTTLS, port 587)
- **Queue:** In-process async queue with exponential backoff retry
- **Cron:** node-cron (daily SMTP pool reset)

## Database Schema

| Table | Key Fields |
|-------|-----------|
| `developers` | `id` (text PK), `api_key`, `company_name`, `rate_limit_per_min` |
| `smtp_pool` | `id` (serial PK), `gmail_username`, `app_password`, `daily_sent_count`, `max_daily_limit`, `last_used_timestamp`, `status` |
| `email_logs` | `id` (text PK = message UUID), `developer_id`, `recipient`, `template_used`, `status`, `error_message`, `created_at` |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (set automatically by workflow) |

## Local Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set environment
export DATABASE_URL="postgres://user:pass@localhost:5432/oraclex"

# 3. Push schema
pnpm --filter @workspace/db run push

# 4. Seed test data
npx tsx scripts/src/seed.ts

# 5. Start server
pnpm --filter @workspace/api-server run dev
```

## API Reference

All routes require: `Authorization: Bearer <API_KEY>`

Base URL: `https://<your-domain>/api/v1`

---

### Send Email

```
POST /api/v1/email/send
```

**Headers:**
```
Authorization: Bearer oraclex_live_test_key_xyz123
Content-Type: application/json
```

**Body:**
```json
{
  "to": "user@example.com",
  "template": "verification",
  "senderName": "MySaaS",
  "data": {
    "code": "847291"
  }
}
```

**Response `202 Accepted`:**
```json
{
  "messageId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued"
}
```

---

### curl Examples (Seed Test Key)

**Send a verification email:**
```bash
curl -X POST https://localhost/api/v1/email/send \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "template": "verification",
    "senderName": "MySaaS",
    "data": { "code": "847291" }
  }'
```

**Send an OTP:**
```bash
curl -X POST https://localhost/api/v1/email/send \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "template": "otp",
    "senderName": "MyApp",
    "data": { "otp": "382910", "expiry": "10" }
  }'
```

**Send a password reset:**
```bash
curl -X POST https://localhost/api/v1/email/send \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "template": "password-reset",
    "senderName": "MyApp",
    "data": { "resetUrl": "https://myapp.com/reset?token=abc123", "expiry": "15" }
  }'
```

**Send a magic link:**
```bash
curl -X POST https://localhost/api/v1/email/send \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "template": "magic-link",
    "senderName": "MyApp",
    "data": { "magicUrl": "https://myapp.com/auth/magic?token=xyz789", "expiry": "15" }
  }'
```

**Send a welcome email:**
```bash
curl -X POST https://localhost/api/v1/email/send \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "newuser@example.com",
    "template": "welcome-email",
    "senderName": "MyApp",
    "data": { "name": "Alex", "dashboardUrl": "https://myapp.com/dashboard" }
  }'
```

**Send a security alert:**
```bash
curl -X POST https://localhost/api/v1/email/send \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "template": "security-alert",
    "senderName": "MyApp",
    "data": {
      "time": "2026-06-06 14:32 UTC",
      "location": "San Francisco, CA",
      "device": "Chrome on macOS",
      "secureUrl": "https://myapp.com/settings/security"
    }
  }'
```

---

### List Email Logs

```bash
curl https://localhost/api/v1/email/logs \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123"

# Filter by status
curl "https://localhost/api/v1/email/logs?status=failed&limit=20" \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123"
```

### Get Single Log

```bash
curl https://localhost/api/v1/email/logs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123"
```

### SMTP Pool Status

```bash
curl https://localhost/api/v1/smtp/pool \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123"
```

**Response:**
```json
{
  "nodes": [
    {
      "id": 1,
      "gmailUsername": "oraclex.relay01@gmail.com",
      "dailySentCount": 42,
      "maxDailyLimit": 500,
      "lastUsedTimestamp": 1717689600000,
      "status": "active"
    }
  ],
  "activeCount": 2,
  "totalCapacityRemaining": 958
}
```

### Delivery Statistics

```bash
curl https://localhost/api/v1/stats \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123"
```

**Response:**
```json
{
  "total": 150,
  "sent": 143,
  "failed": 5,
  "queued": 2,
  "successRate": 95.33
}
```

## Built-in Templates

| Template | Key Variables |
|----------|--------------|
| `verification` | `code` |
| `otp` | `otp`, `expiry` |
| `password-reset` | `resetUrl`, `expiry` |
| `magic-link` | `magicUrl`, `expiry` |
| `security-alert` | `time`, `location`, `device`, `secureUrl` |
| `welcome-email` | `name`, `dashboardUrl` |

All templates support `{{senderName}}` automatically from the request payload.

## SMTP Rotation Logic

1. **Select:** `SELECT * FROM smtp_pool WHERE status = 'active' AND daily_sent_count < max_daily_limit ORDER BY last_used_timestamp ASC LIMIT 1`
2. **Deliver:** STARTTLS to `smtp.gmail.com:587` with the selected node credentials
3. **On success:** Increment `daily_sent_count`, update `last_used_timestamp`
4. **On failure:** Set node status to `rate_limited` or `locked`, retry with next available node (up to 3x, exponential backoff: 5s, 10s, 20s)
5. **Daily reset:** `UPDATE smtp_pool SET daily_sent_count = 0 WHERE status != 'locked'` at 00:00 UTC

## Adding Gmail Relay Nodes

```bash
curl -X POST https://localhost/api/v1/email/send \
  -H "Authorization: Bearer oraclex_live_test_key_xyz123"
# Then insert directly into smtp_pool via your DB client:
```

```sql
INSERT INTO smtp_pool (gmail_username, app_password, daily_sent_count, max_daily_limit, last_used_timestamp, status)
VALUES ('yourrelay@gmail.com', 'your_app_password', 0, 500, 0, 'active');
```

> **Note:** Use Gmail App Passwords (not your account password). Enable 2FA, then generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
