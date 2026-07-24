---
id: ADR-004
title: Database Architecture - Neon PostgreSQL + Drizzle ORM
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Database Architecture - Neon PostgreSQL + Drizzle ORM

## Status

Accepted

## Context

Lumora ERP needs a relational database that supports complex financial queries, multi-tenancy via row-level security, JSON operations, and full-text search. The ORM must provide type safety, migration tooling, and SQL-like API.

## Decision

Use Neon PostgreSQL (serverless) with Drizzle ORM 1.0.0-rc.4 (beta).

### Connection Strategy

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

### Schema Organization

```
packages/database/src/
├── schema/
│   ├── index.ts
│   ├── auth/
│   │   ├── users.ts
│   │   ├── roles.ts
│   │   └── sessions.ts
│   ├── financial/
│   │   ├── accounts.ts
│   │   ├── journal-entries.ts
│   │   └── journal-entry-lines.ts
│   ├── inventory/
│   │   ├── items.ts
│   │   ├── stock-movements.ts
│   │   └── warehouses.ts
│   ├── common/
│   │   ├── audit.ts
│   │   └── money.ts
│   └── tenant/
│       └── tenants.ts
├── migrations/
├── index.ts
└── seed.ts
```

### Schema Definition Pattern

```typescript
import { pgTable, uuid, varchar, decimal, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  parentId: uuid('parent_id').references((): any => accounts.id),
  chartId: uuid('chart_id').notNull().references(() => charts.id),
  balance: decimal('balance', { precision: 19, scale: 4 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  tenantId: uuid('tenant_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | snake_case, plural | `accounts`, `journal_entries` |
| Columns | snake_case | `created_at`, `parent_id` |
| Primary keys | `id` | `id` |
| Foreign keys | `{table}_id` | `chart_id`, `user_id` |
| Indexes | `idx_{table}_{columns}` | `idx_accounts_code` |

### Money Handling

```typescript
// Always use decimal(19,4) for monetary values
// Store in minor units (cents) for display
// Use string type in TypeScript to avoid floating point
balance: decimal('balance', { precision: 19, scale: 4 }).notNull().default('0'),
```

## Consequences

### Positive

- Neon serverless Postgres — scales to zero, branches for preview environments
- Drizzle ORM 1.0-rc — type-safe queries, improved type inference, lightweight
- drizzle-zod 1.0-beta — automatic Zod schema generation from table definitions
- UUID v7 primary keys — time-ordered, globally unique
- Row-level security for multi-tenancy

### Negative

- Drizzle ORM RC is beta — API may have changes before 1.0 stable release
- Neon serverless has cold start latency (mitigated by connection pooling)
- Decimal precision requires careful handling in application layer

### Risks

- Neon pricing model may change
- Drizzle Kit migrations may need manual intervention for complex schema changes

## Alternatives Considered

### Prisma

**Pros:** Large ecosystem, excellent docs, mature.

**Cons:** Heavier runtime, code generation step, less SQL-like, larger bundle.

### Supabase (PostgreSQL)

**Pros:** Built-in auth, realtime, storage.

**Cons:** Less control, vendor lock-in, may conflict with our auth/storage choices.

### Planetscale (MySQL)

**Pros:** Branching, serverless.

**Cons:** MySQL — less suitable for complex financial queries, no PL/pgSQL.

## Related ADRs

- ADR-001: Technology Stack
- ADR-010: Multi-Tenancy & Row-Level Security
- ADR-007: Domain-Driven Design

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
