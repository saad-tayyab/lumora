# Config Package

> **Status:** Active  
> **Version:** 0.0.1  
> **Stack:** TypeScript + Environment Variables

---

## Purpose

Shared configuration for all packages. Loads and validates environment variables.

---

## Structure

```
packages/config/src/
├── env.ts                     # Environment variable validation
├── database.ts                # Database config
├── auth.ts                    # Auth config
├── storage.ts                 # Storage config
├── email.ts                   # Email config
├── payment.ts                 # Payment config
└── index.ts                   # Package exports
```

---

## Usage

```typescript
import { config } from '@lumora/config';

console.log(config.database.url);
console.log(config.auth.secret);
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Auth secret key |
| `STRIPE_SECRET_KEY` | Yes | Stripe API key |
| `RESEND_API_KEY` | Yes | Resend API key |
| `APP_URL` | Yes | Application URL |

---

## Development

```bash
# Build
bun build

# Check
bun check
```
