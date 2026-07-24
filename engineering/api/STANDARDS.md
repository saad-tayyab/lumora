# API Engineering Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Backend Team  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines API engineering standards for the Lumora ERP system. All APIs must comply with these standards.

---

## 2. API Design Principles

1. **RESTful** — Follow REST conventions.
2. **Consistent** — Same patterns across all endpoints.
3. **Type-safe** — Full TypeScript type coverage.
4. **Versioned** — API versioning for backward compatibility.
5. **Documented** — OpenAPI specification.

---

## 3. Endpoint Naming

### 3.1 URL Patterns

| Method | Pattern | Description |
|--------|---------|-------------|
| GET | `/resources` | List resources |
| GET | `/resources/:id` | Get single resource |
| POST | `/resources` | Create resource |
| PUT | `/resources/:id` | Update resource (full) |
| PATCH | `/resources/:id` | Update resource (partial) |
| DELETE | `/resources/:id` | Delete resource |

### 3.2 Examples

```
GET    /accounts              # List accounts
GET    /accounts/:id          # Get account
POST   /accounts              # Create account
PUT    /accounts/:id          # Update account
DELETE /accounts/:id          # Delete account

GET    /invoices              # List invoices
GET    /invoices/:id          # Get invoice
POST   /invoices              # Create invoice
POST   /invoices/:id/submit   # Submit invoice (action)
POST   /invoices/:id/pay      # Pay invoice (action)
```

### 3.3 Sub-resources

```
GET    /invoices/:id/items    # List invoice items
POST   /invoices/:id/items    # Add invoice item
```

---

## 4. Request/Response Format

### 4.1 Request Body

```typescript
// Always use Zod for validation
import { z } from 'zod';

const CreateInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
  dueDate: z.string().datetime(),
});
```

### 4.2 Response Format

```typescript
// Single resource
interface AccountResponse {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: string;
  createdAt: string;
}

// List response
interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Error response
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### 4.3 Pagination

```
GET /accounts?page=1&limit=20
GET /accounts?sort=code&order=asc
GET /accounts?search=bank
```

---

## 5. Error Handling

### 5.1 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `UNPROCESSABLE` | 422 | Business rule violation |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### 5.2 Error Response

```typescript
// Always return structured errors
throw new APIError('VALIDATION_ERROR', 'Invalid invoice', {
  customerId: ['Customer not found'],
  items: ['At least one item required'],
});
```

---

## 6. Authentication & Authorization

### 6.1 Authentication

```typescript
// Every endpoint must check authentication
import { authenticate } from '../lib/auth';

export const getAccount = api(
  { expose: true, method: 'GET', path: '/accounts/:id' },
  async ({ id }: { id: string }) => {
    const user = await authenticate();
    return service.getAccount(id, user);
  }
);
```

### 6.2 Authorization

```typescript
// Use role-based access control
import { authorize } from '../lib/auth';

export const deleteAccount = api(
  { expose: true, method: 'DELETE', path: '/accounts/:id' },
  async ({ id }: { id: string }) => {
    const user = await authenticate();
    authorize(user, 'account:delete');
    return service.deleteAccount(id);
  }
);
```

---

## 7. Best Practices

1. **Always validate input** — Use Zod schemas.
2. **Always return proper HTTP status codes**.
3. **Always handle errors** — Never throw raw errors.
4. **Always use type-safe responses** — No `any` types.
5. **Always add rate limiting** — Protect public endpoints.
6. **Always log requests** — For debugging and audit.
7. **Never expose internal errors** — Map to user-friendly messages.
8. **Never skip authentication** — Every endpoint must be protected.

---

## 8. Anti-patterns

| Anti-pattern | Correct Approach |
|-------------|-----------------|
| Returning raw errors | Map to structured error responses |
| Missing validation | Validate all inputs with Zod |
| Using GET for mutations | Use POST/PUT/PATCH/DELETE |
| Returning 200 for errors | Use appropriate HTTP status codes |
| Missing pagination | Always paginate list endpoints |
| Hardcoded URLs | Use environment variables |
| No rate limiting | Add rate limiting to public endpoints |
