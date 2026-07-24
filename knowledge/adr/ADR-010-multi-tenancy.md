---
id: ADR-010
title: Multi-Tenancy & Row-Level Security
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Multi-Tenancy & Row-Level Security

## Status

Accepted

## Context

Lumora ERP serves multiple organizations (tenants). Each tenant's data must be isolated, and users must only access their own tenant's data. The solution must be cost-effective, operationally simple, and support future scaling.

## Decision

Implement multi-tenancy via row-level security (RLS) with tenant ID on every table.

### Tenant Isolation Strategy

```
Every table includes:
├── tenantId: uuid('tenant_id').notNull()
├── createdAt: timestamp('created_at').notNull().defaultNow()
├── updatedAt: timestamp('updated_at').notNull().defaultNow()
└── deletedAt: timestamp('deleted_at')  // soft delete
```

### Row-Level Security Policy

```sql
-- PostgreSQL RLS policy
CREATE POLICY tenant_isolation ON accounts
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
```

### Tenant Context Setting

```typescript
// Set tenant context for each request
await sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
```

### Tenant-Aware Repository Pattern

```typescript
export async function findAccounts(tenantId: string) {
  return db.query.accounts.findMany({
    where: eq(accounts.tenantId, tenantId),
  });
}
```

## Consequences

### Positive

- Single database — simpler operations, lower cost
- RLS enforced at database level — can't be bypassed by application bugs
- Same schema for all tenants — migration simplicity
- Cost-effective for small-to-medium tenants

### Negative

- Noisy neighbor risk — one tenant's queries can affect others
- Complex queries must always filter by tenant
- Data export/import per tenant requires care

### Risks

- RLS policies must be tested thoroughly — bugs cause data leaks
- Performance degradation with many tenants on same database
- Tenant data migration between databases is complex

## Alternatives Considered

### Schema-per-Tenant

**Pros:** Complete isolation, easy data export.

**Cons:** Higher cost, complex migrations (must update all schemas), harder to maintain.

### Database-per-Tenant

**Pros:** Complete isolation, independent scaling.

**Cons:** Highest cost, connection pool management, complex operations.

### Application-Level Filtering

**Pros:** Simplest to implement.

**Cons:** No database-level enforcement — bugs cause data leaks, security risk.

## Related ADRs

- ADR-004: Database Architecture
- ADR-005: Authentication
- ADR-007: Domain-Driven Design

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
