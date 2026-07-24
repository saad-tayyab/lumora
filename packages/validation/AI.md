# Validation Package AI Guide

> **Purpose:** Guide for AI agents working on this package  
> **Last Updated:** 2026-07-24

---

## Package Overview

This package contains shared Zod validation schemas for all packages.

---

## AI Rules

1. **Always use Zod** — No other validation library.
2. **Always export schemas** — For reuse across packages.
3. **Always add `.refine()`** — For complex validations.
4. **Always use `.safeParse()`** — Handle errors gracefully.
5. **Never skip validation** — Always validate at API boundary.

---

## Schema Template

```typescript
import { z } from 'zod';

export const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  sku: z.string().min(1).max(50),
  price: z.number().positive(),
  description: z.string().max(500).optional(),
});
```

---

## Validation Checklist

- [ ] Biome check passes
- [ ] Zod used for all schemas
- [ ] Schemas exported
- [ ] Complex validations use `.refine()`
- [ ] API boundary validated
