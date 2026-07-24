# Validation Package

> **Status:** Active  
> **Version:** 0.0.1  
> **Stack:** Zod

---

## Purpose

Shared Zod validation schemas for all packages.

---

## Structure

```
packages/validation/src/
├── schemas/
│   ├── auth.ts                # Auth schemas
│   ├── financial.ts           # Financial schemas
│   ├── inventory.ts           # Inventory schemas
│   ├── common.ts              # Common schemas
│   └── index.ts
├── middleware/
│   └── validate.ts            # Validation middleware
└── index.ts                   # Package exports
```

---

## Usage

```typescript
import { CreateInvoiceSchema, validate } from '@lumora/validation';

// Validate data
const result = CreateInvoiceSchema.safeParse(data);
if (!result.success) {
  console.error(result.error);
}

// Use with middleware
app.post('/invoices', validate(CreateInvoiceSchema), handler);
```

---

## Schemas

| Schema | Purpose |
|--------|---------|
| CreateInvoiceSchema | Validate invoice creation |
| UpdateInvoiceSchema | Validate invoice update |
| CreateAccountSchema | Validate account creation |
| LoginSchema | Validate login credentials |

---

## Development

```bash
# Build
bun build

# Check
bun check
```
