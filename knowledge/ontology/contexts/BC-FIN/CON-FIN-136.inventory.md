---
id: CON-FIN-136
name: Inventory
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Inventory

## Definition

Merchandise on hand (not yet sold) at the end of an accounting period. Reported as a current asset on the balance sheet.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| reporting | string | Current asset on balance sheet |
| valuation | cost | Valued at cost to the business |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
