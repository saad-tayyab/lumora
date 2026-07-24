# Database Engineering Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Database Team  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines database engineering standards for the Lumora ERP system. All database code must comply with these standards.

---

## 2. Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Neon PostgreSQL | Latest | Database |
| Drizzle ORM | v1 | ORM |
| Drizzle Kit | Latest | Migration tool |

---

## 3. Schema Design

### 3.1 File Structure

```
packages/database/src/
├── schema/
│   ├── index.ts              # Schema exports
│   ├── auth/
│   │   ├── users.ts
│   │   ├── roles.ts
│   │   └── index.ts
│   ├── financial/
│   │   ├── accounts.ts
│   │   ├── journal-entries.ts
│   │   ├── journal-entry-lines.ts
│   │   └── index.ts
│   ├── inventory/
│   │   ├── items.ts
│   │   ├── stock-movements.ts
│   │   └── index.ts
│   └── common/
│       ├── audit.ts          # Shared audit fields
│       └── money.ts          # Money value object
├── migrations/               # Generated migrations
├── index.ts                  # Database connection
└── seed.ts                   # Seed script
```

### 3.2 Schema Definition

```typescript
// schema/financial/accounts.ts
import { pgTable, uuid, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // asset, liability, equity, revenue, expense
  parentId: uuid('parent_id').references((): any => accounts.id),
  chartId: uuid('chart_id').notNull().references(() => charts.id),
  balance: decimal('balance', { precision: 19, scale: 4 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);
```

### 3.3 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | snake_case, plural | `accounts`, `journal_entries` |
| Columns | snake_case | `created_at`, `parent_id` |
| Primary keys | `id` | `id` |
| Foreign keys | `{table}_id` | `chart_id`, `user_id` |
| Indexes | `idx_{table}_{columns}` | `idx_accounts_code` |
| Constraints | `chk_{table}_{rule}` | `chk_accounts_type` |

### 3.4 Common Fields

Every table must include:

```typescript
{
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}
```

Soft-deleted tables add:

```typescript
{
  deletedAt: timestamp('deleted_at'),
}
```

---

## 4. Migrations

### 4.1 Migration Rules

1. **Never modify generated migrations** — Regenerate instead.
2. **Always add description** — Explain what the migration does.
3. **Always test rollback** — Ensure migrations can be reversed.
4. **Never drop columns** — Deprecate first, drop later.
5. **Never rename columns** — Add new, migrate data, drop old.

### 4.2 Migration Commands

```bash
# Generate migration
bun run db:generate

# Run migrations
bun run db:migrate

# Reset database
bunx drizzle-kit drop
bun run db:migrate
bun run db:seed
```

---

## 5. Query Patterns

### 5.1 Repository Pattern

```typescript
// Always use repository pattern
export async function findInvoicesByCustomer(customerId: string) {
  return db.query.invoices.findMany({
    where: eq(invoices.customerId, customerId),
    with: {
      items: true,
      payments: true,
    },
  });
}
```

### 5.2 Transactions

```typescript
// Always use transactions for multi-step operations
await db.transaction(async (tx) => {
  const invoice = await tx.insert(invoices).values(data).returning();
  await tx.insert(invoiceItems).values(items);
  await tx.insert(journalEntries).values(journalData);
});
```

### 5.3 Pagination

```typescript
// Always support pagination
export async function listAccounts(page: number, limit: number) {
  const offset = (page - 1) * limit;
  const data = await db.query.accounts.findMany({
    limit,
    offset,
    orderBy: asc(accounts.code),
  });
  const total = await db.select({ count: count() }).from(accounts);
  return { data, total: total[0].count, page, limit };
}
```

---

## 6. Best Practices

1. **Always use decimal for money** — Never float.
2. **Always use UUIDs** — No sequential IDs.
3. **Always add indexes** — On frequently queried columns.
4. **Always validate schemas** — Use drizzle-zod.
5. **Always use parameterized queries** — Drizzle enforces this.
6. **Never store passwords** — Use Better Auth.
7. **Never expose database errors** — Map to user-friendly messages.

---

## 7. Anti-patterns

| Anti-pattern | Correct Approach |
|-------------|-----------------|
| Float for money | Use decimal(19,4) |
| Sequential IDs | Use UUIDs |
| Missing indexes | Add indexes on query columns |
| N+1 queries | Use joins or batch loading |
| Raw SQL strings | Use Drizzle ORM |
| Skipping migrations | Always generate migrations |
| Modifying generated files | Regenerate instead |
