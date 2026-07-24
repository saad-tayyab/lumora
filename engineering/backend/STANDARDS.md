# Backend Engineering Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Backend Team  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines backend engineering standards for the Lumora ERP system. All backend code must comply with these standards.

---

## 2. Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Encore.ts | Latest | API framework |
| Bun | Latest | Runtime |
| Drizzle ORM | 1.0.0-rc.4 | Database access |
| Neon PostgreSQL | Latest | Database |

---

## 3. Encore.ts Rules

### 3.1 Service Structure

```
services/backend/src/
├── features/
│   ├── financial/
│   │   ├── accounts/
│   │   │   ├── accounts.api.ts       # API definitions
│   │   │   ├── accounts.service.ts   # Business logic
│   │   │   ├── accounts.repo.ts      # Data access
│   │   │   ├── accounts.types.ts     # TypeScript types
│   │   │   └── accounts.test.ts      # Tests
│   │   ├── journal-entries/
│   │   └── index.ts
│   ├── inventory/
│   ├── auth/
│   └── index.ts
├── lib/
│   ├── middleware/
│   ├── errors/
│   └── utils/
├── config/
│   └── database.ts
└── index.ts                            # Service entry
```

### 3.2 API Definition

```typescript
import { api } from 'encore.dev/api';

interface CreateInvoiceRequest {
  customerId: string;
  items: InvoiceItem[];
}

interface Invoice {
  id: string;
  total: number;
  status: 'draft' | 'sent' | 'paid';
}

export const createInvoice = api(
  { expose: true, method: 'POST', path: '/invoices' },
  async (req: CreateInvoiceRequest): Promise<Invoice> => {
    // Validate input
    // Process business logic
    // Return result
  }
);
```

### 3.3 Error Handling

```typescript
import { APIError } from 'encore.dev/api';

class InsufficientStockError extends APIError {
  constructor(itemId: string, requested: number, available: number) {
    super('InsufficientStock', `Insufficient stock for ${itemId}`, {
      itemId,
      requested,
      available,
    });
  }
}
```

---

## 4. Service Layer Pattern

### 4.1 Repository Layer

```typescript
// accounts.repo.ts
import { db } from '@lumora/database';
import { accounts } from '@lumora/database/schema';

export async function findAccountById(id: string) {
  return db.query.accounts.findFirst({
    where: eq(accounts.id, id),
  });
}

export async function createAccount(data: InsertAccount) {
  return db.insert(accounts).values(data).returning();
}
```

### 4.2 Service Layer

```typescript
// accounts.service.ts
import * as repo from './accounts.repo';
import { AccountNotFoundError } from './accounts.errors';

export async function getAccount(id: string) {
  const account = await repo.findAccountById(id);
  if (!account) {
    throw new AccountNotFoundError(id);
  }
  return account;
}
```

### 4.3 API Layer

```typescript
// accounts.api.ts
import { api } from 'encore.dev/api';
import * as service from './accounts.service';

export const getAccount = api(
  { expose: true, method: 'GET', path: '/accounts/:id' },
  async ({ id }: { id: string }) => {
    return service.getAccount(id);
  }
);
```

---

## 5. Middleware

```typescript
// lib/middleware/auth.ts
import { middleware } from 'encore.dev/middleware';

export const authMiddleware = middleware(async (req, next) => {
  // Validate authentication
  // Attach user to request context
  return next(req);
});
```

---

## 6. Best Practices

1. **Always validate input** — Use Zod schemas at API boundary.
2. **Always handle errors** — Return meaningful error messages.
3. **Always use transactions** — For multi-step operations.
4. **Always log operations** — For debugging and audit.
5. **Always use parameterized queries** — Drizzle enforces this.
6. **Never expose internal errors** — Map to user-friendly messages.
7. **Never skip authentication** — Every endpoint must be protected.

---

## 7. Anti-patterns

| Anti-pattern | Correct Approach |
|-------------|-----------------|
| Business logic in API handlers | Delegate to service layer |
| Direct SQL queries | Use Drizzle ORM |
| Skipping error handling | Always catch and handle |
| Hardcoded configuration | Use environment variables |
| Missing validation | Validate all inputs |
| N+1 queries | Use joins or batch loading |
| Sensitive data in logs | Sanitize log output |
