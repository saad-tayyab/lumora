# Database Package

> **Status:** Active  
> **Version:** 0.0.1  
> **Stack:** Drizzle ORM + Neon PostgreSQL

---

## Purpose

Shared database schemas, migrations, and query utilities for the Lumora ERP system.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Drizzle ORM | Database access |
| Drizzle Kit | Migration tool |
| Neon PostgreSQL | Database |
| drizzle-zod | Schema validation |

---

## Structure

```
packages/database/src/
├── schema/
│   ├── index.ts
│   ├── auth/
│   │   ├── users.ts
│   │   ├── roles.ts
│   │   └── index.ts
│   ├── financial/
│   │   ├── accounts.ts
│   │   ├── journal-entries.ts
│   │   └── index.ts
│   ├── inventory/
│   │   ├── items.ts
│   │   └── index.ts
│   └── common/
│       └── audit.ts
├── migrations/
├── index.ts
└── seed.ts
```

---

## Usage

```typescript
import { db } from '@lumora/database';
import { accounts } from '@lumora/database/schema';

// Query
const allAccounts = await db.select().from(accounts);

// Insert
await db.insert(accounts).values({
  code: '1000',
  name: 'Cash',
  type: 'asset',
});
```

---

## Schema Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | snake_case, plural | `accounts` |
| Columns | snake_case | `created_at` |
| Primary keys | `id` | `id` |
| Foreign keys | `{table}_id` | `chart_id` |

---

## Development

```bash
# Generate migration
bun run db:generate

# Run migrations
bun run db:migrate

# Reset database
bunx drizzle-kit drop

# Seed database
bun run db:seed
```
