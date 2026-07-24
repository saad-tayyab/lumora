---
template_id: TPL-004
name: Entity Template
type: entity
version: 1.0.0
description: Template for creating database entity definitions
---

# {{ENTITY_NAME}}

## Metadata

| Field | Value |
|-------|-------|
| Table | `{{TABLE_NAME}}` |
| Name | {{ENTITY_NAME}} |
| Context | {{BOUNDED_CONTEXT}} |
| Version | {{VERSION}} |

---

## Schema

```typescript
import { pgTable, uuid, varchar, decimal, timestamp, boolean } from 'drizzle-orm/pg-core';

export const {{TABLE_NAME}} = pgTable('{{TABLE_NAME}}', {
  id: uuid('id').primaryKey().defaultRandom(),
  {{COLUMNS}}
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

---

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | no | gen_random_uuid() | Primary key |
| {{COLUMN_NAME}} | {{COLUMN_TYPE}} | {{NULLABLE}} | {{DEFAULT}} | {{DESCRIPTION}} |
| created_at | Timestamp | no | now() | Creation timestamp |
| updated_at | Timestamp | no | now() | Last update timestamp |

---

## Indexes

| Name | Columns | Type | Description |
|------|---------|------|-------------|
| idx_{{TABLE}}_{{COLUMN}} | {{COLUMN}} | btree | {{DESCRIPTION}} |

---

## Foreign Keys

| Column | References | On Delete | Description |
|--------|-----------|-----------|-------------|
| {{COLUMN}} | {{TABLE}}.id | {{ACTION}} | {{DESCRIPTION}} |

---

## Validation Schema

```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insert{{ENTITY}}Schema = createInsertSchema({{TABLE_NAME}});
export const select{{ENTITY}}Schema = createSelectSchema({{TABLE_NAME}});
```

---

## Related

- Concept: [CON-{{CONTEXT}}-{{NUM}}]({{CONCEPT_PATH}})
- Repository: [{{REPO_FILE}}]({{REPO_PATH}})
- Service: [{{SERVICE_FILE}}]({{SERVICE_PATH}})

---

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| {{VERSION}} | {{DATE}} | Initial definition | {{AUTHOR}} |
