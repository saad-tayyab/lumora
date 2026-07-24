---
id: CON-FIN-160
name: Coupon (Point-of-Sale)
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Coupon (Point-of-Sale)

## Definition

A coupon presented at the time of sale that reduces the revenue from the sale. No liability is recorded at issuance; the coupon reduces sales when redeemed.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| recording | entry | Reduce Cash/Sales by coupon amount at time of sale |
| liability_at_issuance | boolean | No liability recorded when coupon is issued |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
