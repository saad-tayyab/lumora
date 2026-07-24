# Auth Package

> **Status:** Active  
> **Version:** 0.0.1  
> **Stack:** Better Auth

---

## Purpose

Shared authentication and authorization utilities for the Lumora ERP system.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Better Auth | Authentication |

---

## Structure

```
packages/auth/src/
├── client.ts                  # Auth client configuration
├── server.ts                  # Auth server configuration
├── middleware.ts               # Auth middleware
├── roles.ts                   # Role definitions
├── permissions.ts             # Permission definitions
├── index.ts                   # Package exports
└── types.ts                   # TypeScript types
```

---

## Usage

```typescript
// Client-side
import { authClient } from '@lumora/auth';
const session = await authClient.getSession();

// Server-side
import { auth } from '@lumora/auth';
const session = await auth.api.getSession(req);
```

---

## Roles

| Role | Description |
|------|-------------|
| admin | Full system access |
| manager | Department management |
| accountant | Financial operations |
| viewer | Read-only access |

---

## Development

```bash
# Start dev
bun dev

# Build
bun build

# Check
bun check
```
