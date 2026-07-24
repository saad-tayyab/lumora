---
id: CTR-INV-002
concept: CON-INV-001 (Item)
attribute: category_id
type: required
scope: item
description: "Items must belong to exactly one item category"
severity: error
version: 1.0.0
status: active
---

# CTR-INV-002: Item Category Required

## Rule
Every Item must reference exactly one ItemCategory (CON-INV-002). The category_id field is mandatory and cannot be null.

## Invariant Reference
INV-INV-003: Items must belong to exactly one item category.

## Violation
Attempting to create or update an item without a valid category_id.
