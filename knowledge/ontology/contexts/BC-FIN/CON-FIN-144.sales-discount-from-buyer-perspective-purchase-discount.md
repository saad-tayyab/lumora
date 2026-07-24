---
id: CON-FIN-144
name: Sales Discount (from Buyer Perspective: Purchase Discount)
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

# Sales Discount (from Buyer Perspective: Purchase Discount)

## Definition

A discount offered by a seller to encourage early payment of an invoice. From the buyer's perspective, it is a purchase discount.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| terms | string | Format: discount%/discount_days, net/net_days |
| annualized_cost | percentage | Cost of not taking the discount can be very high annually |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
