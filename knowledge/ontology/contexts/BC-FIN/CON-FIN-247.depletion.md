---
id: CON-FIN-247
name: Depletion
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Depletion

## Definition

The allocation of the cost of natural resources to expense as they are harvested, mined, or extracted. Computed as Depletion Rate × Quantity Removed.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| depletion_rate | decimal | Cost of resource / Estimated total units |
| quantity_removed | integer | Units removed during the period |
| depletion_expense | decimal | Depletion rate × quantity removed |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
