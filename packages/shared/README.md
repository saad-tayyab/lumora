# Shared Package

> **Status:** Active  
> **Version:** 0.0.1  
> **Stack:** TypeScript

---

## Purpose

Shared types, utilities, and constants used across all packages.

---

## Structure

```
packages/shared/src/
├── types/
│   ├── common.ts              # Common types (ID, Date, etc.)
│   ├── financial.ts           # Financial types
│   ├── inventory.ts           # Inventory types
│   └── index.ts
├── utils/
│   ├── format.ts              # Formatting utilities
│   ├── validate.ts            # Validation utilities
│   └── index.ts
├── constants/
│   ├── errors.ts              # Error codes
│   └── index.ts
└── index.ts
```

---

## Usage

```typescript
import { formatCurrency, type Money } from '@lumora/shared';

const amount: Money = { value: 10000, currency: 'USD' };
const formatted = formatCurrency(amount); // "$100.00"
```

---

## Types

| Type | Description |
|------|-------------|
| ID | Branded string type |
| Money | Currency amount |
| DateRange | Start and end dates |
| Pagination | Page and limit |

---

## Development

```bash
# Build
bun build

# Check
bun check
```
