---
id: ADR-009
title: API Design & Error Handling
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# API Design & Error Handling

## Status

Accepted

## Context

Lumora ERP needs consistent, type-safe APIs that follow REST conventions, provide structured error responses, and support authentication, authorization, and input validation.

## Decision

Use RESTful conventions with Zod v4 validation and structured error responses.

### Endpoint Naming

| Method | Pattern | Description |
|--------|---------|-------------|
| GET | `/resources` | List resources |
| GET | `/resources/:id` | Get single resource |
| POST | `/resources` | Create resource |
| PUT | `/resources/:id` | Update resource (full) |
| PATCH | `/resources/:id` | Update resource (partial) |
| DELETE | `/resources/:id` | Delete resource |

### Request Validation (Zod v4)

```typescript
import { z } from 'zod';

const CreateInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().positive().max(10000),
    unitPrice: z.number().positive().max(1000000),
  })).min(1).max(100),
  dueDate: z.string().datetime(),
});

type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
```

### Response Format

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

### Error Codes

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

### Pagination

```
GET /accounts?page=1&limit=20
GET /accounts?sort=code&order=asc
GET /accounts?search=bank
```

## Consequences

### Positive

- Consistent API surface across all endpoints
- Zod v4 provides excellent validation with type inference
- Structured error responses enable consistent frontend handling
- Pagination supports large datasets efficiently

### Negative

- REST requires more endpoints than GraphQL for complex queries
- Over-fetching possible with REST (mitigated by field selection)

### Risks

- API versioning strategy needed for breaking changes
- Zod v4 migration from v3 requires code updates

## Alternatives Considered

### GraphQL

**Pros:** Flexible queries, single endpoint, strong typing.

**Cons:** More complex setup, N+1 query risk, learning curve, less suitable for ERP CRUD.

### tRPC

**Pros:** End-to-end type safety without schema definition.

**Cons:** Tightly coupled to TypeScript, less suitable for public APIs.

## Related ADRs

- ADR-001: Technology Stack
- ADR-003: Backend Framework
- ADR-005: Authentication

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
