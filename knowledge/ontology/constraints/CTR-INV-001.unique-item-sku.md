---
id: CTR-INV-001
concept: CON-INV-001 (Item)
attribute: sku
type: unique
scope: tenant_id
description: "SKU codes must be unique within a tenant"
severity: error
version: 1.0.0
status: active
---

# CTR-INV-001: Unique Item SKU

## Rule
Each Item must have a unique SKU within its tenant.

## Scope
All active items within a single tenant.

## Violation
Attempting to create or update an item with a SKU that already exists in the same tenant.
