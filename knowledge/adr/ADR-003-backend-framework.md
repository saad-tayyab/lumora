---
id: ADR-003
title: Backend Framework - Encore.ts
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Backend Framework - Encore.ts

## Status

Accepted

## Context

Lumora ERP needs a backend framework that provides type-safe APIs, built-in infrastructure (database, auth, storage), and excellent DX. The framework must support DDD patterns, clean architecture, and scale to handle ERP workloads.

## Decision

Use Encore.ts v1.57.13 as the backend API framework.

### Service Structure

```
services/backend/src/
├── features/
│   ├── financial/
│   │   ├── accounts/
│   │   │   ├── accounts.api.ts
│   │   │   ├── accounts.service.ts
│   │   │   ├── accounts.repo.ts
│   │   │   ├── accounts.types.ts
│   │   │   └── accounts.test.ts
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
└── index.ts
```

### API Definition Pattern

```typescript
import { api } from 'encore.dev/api';

export const createInvoice = api(
  { expose: true, method: 'POST', path: '/invoices' },
  async (req: CreateInvoiceRequest): Promise<Invoice> => {
    return invoiceService.create(req);
  }
);
```

### Error Handling Pattern

```typescript
import { APIError } from 'encore.dev/api';

export class InsufficientStockError extends APIError {
  constructor(itemId: string, requested: number, available: number) {
    super('InsufficientStock', `Insufficient stock for ${itemId}`, {
      itemId, requested, available,
    });
  }
}
```

## Consequences

### Positive

- End-to-end type safety between API definitions and callers
- Built-in API documentation generation
- Structured error handling with typed error codes
- Middleware support for auth, logging, rate limiting
- Service-level isolation enforced by framework

### Negative

- Smaller community than Express/Fastify
- Encore.ts opinionated — less flexibility for non-standard patterns
- Learning curve for Encore-specific patterns

### Risks

- Encore.ts is newer — less Stack Overflow content, fewer third-party integrations
- Framework evolution may require API changes

## Alternatives Considered

### Hono

**Pros:** Ultra-lightweight, edge-compatible, fast.

**Cons:** Minimal opinions — requires more boilerplate for ERP patterns, no built-in service isolation.

### tRPC + Express

**Pros:** End-to-end type safety, large ecosystem.

**Cons:** More setup, requires separate API layer, less structured than Encore.

### Fastify

**Pros:** Fast, plugin-based, good ecosystem.

**Cons:** No built-in type-safe RPC, requires manual OpenAPI generation.

## Related ADRs

- ADR-001: Technology Stack
- ADR-009: API Design & Error Handling
- ADR-007: Domain-Driven Design

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
