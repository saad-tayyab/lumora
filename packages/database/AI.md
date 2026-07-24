# Database Package AI Guide

> **Purpose:** Guide for AI agents working on this package  
> **Last Updated:** 2026-07-24

---

## Package Overview

This package contains Drizzle ORM schemas and database utilities. All database access goes through this package.

---

## AI Rules

1. **Always use Drizzle ORM** — No raw SQL.
2. **Always use decimal for money** — `decimal(19, 4)`.
3. **Always use UUIDs** — `uuid().defaultRandom()`.
4. **Always add common fields** — `id`, `createdAt`, `updatedAt`.
5. **Always add indexes** — On frequently queried columns.
6. **Never use float for money** — Always decimal.
7. **Never skip migrations** — Generate after schema changes.

---

## Schema Template

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  sku: varchar('sku', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertItemSchema = createInsertSchema(items);
export const selectItemSchema = createSelectSchema(items);
```

---

## Validation Checklist

- [ ] Biome check passes
- [ ] Uses decimal for money
- [ ] Uses UUIDs for IDs
- [ ] Common fields present
- [ ] Indexes added
- [ ] drizzle-zod schemas exported
- [ ] Migration generated
