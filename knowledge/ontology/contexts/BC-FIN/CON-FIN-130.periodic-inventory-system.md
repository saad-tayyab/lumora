---
id: CON-FIN-130
name: Periodic Inventory System
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Periodic Inventory System

## Definition

An inventory accounting system where inventory records are not updated continuously for purchases and sales. Instead, inventory is determined by physical count at the end of the accounting period, and cost of goods sold is computed indirectly.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| update_frequency | string | End of period only |
| inventory_account_update | string | Not updated continuously |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
