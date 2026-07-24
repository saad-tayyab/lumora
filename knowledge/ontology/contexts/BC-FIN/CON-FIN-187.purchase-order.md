---
id: CON-FIN-187
name: Purchase Order
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

# Purchase Order

## Definition

A document authorizing the purchase of inventory from an approved vendor. It is the first document in the inventory control process and specifies the items, quantities, and prices ordered.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| vendor | string | Approved vendor name |
| items | string | Description of items ordered |
| quantity | integer | Number of units ordered |
| price | decimal | Agreed-upon unit price |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
