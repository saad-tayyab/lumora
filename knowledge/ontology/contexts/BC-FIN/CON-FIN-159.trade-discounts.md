---
id: CON-FIN-159
name: Trade Discounts
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

# Trade Discounts

## Definition

Special discounts off list prices offered by wholesalers to government agencies or businesses ordering large quantities.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| recording | string | Neither seller nor buyer records list prices or trade discounts; transactions recorded at net price |
| purpose | string | Price differentiation for large-quantity or institutional buyers |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
