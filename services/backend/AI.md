# Backend Service AI Guide

> **Purpose:** Guide for AI agents working on this package  
> **Last Updated:** 2026-07-24

---

## Package Overview

This is the Encore.ts backend service for Lumora ERP. It implements the API layer and business logic.

---

## Key Dependencies

| Package | Import | Purpose |
|---------|--------|---------|
| `@lumora/database` | `@lumora/database` | Database schemas and queries |
| `@lumora/shared` | `@lumora/shared` | Shared types |
| `@lumora/validation` | `@lumora/validation` | Zod schemas |
| `@lumora/auth` | `@lumora/auth` | Auth middleware |

---

## AI Rules

1. **Always use service layer pattern** — API → Service → Repository.
2. **Always validate input** — Use Zod schemas at API boundary.
3. **Always handle errors** — Return structured error responses.
4. **Always use parameterized queries** — Drizzle enforces this.
5. **Always use transactions** — For multi-step operations.
6. **Never expose internal errors** — Map to user-friendly messages.
7. **Never skip authentication** — Every endpoint must be protected.

---

## Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| API | Input validation, HTTP concerns |
| Service | Business logic, orchestration |
| Repository | Data access, queries |

---

## File Template

```typescript
// api.ts
import { api } from 'encore.dev/api';
import * as service from './service';

export const getResource = api(
  { expose: true, method: 'GET', path: '/resources/:id' },
  async ({ id }: { id: string }) => {
    return service.getResource(id);
  }
);
```

---

## Validation Checklist

- [ ] Biome check passes
- [ ] Input validation present
- [ ] Error handling present
- [ ] Authentication present
- [ ] Service layer used
- [ ] Repository pattern used
- [ ] Tests written
