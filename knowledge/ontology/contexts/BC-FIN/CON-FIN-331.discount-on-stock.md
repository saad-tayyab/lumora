---
id: CON-FIN-331
name: Discount on Stock
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

# Discount on Stock

## Definition

The amount by which the issue price of stock is below its par or stated value. Some states prohibit issuing stock at a discount.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| par_value | Money | Par value per share |
| issue_price | Money | Price at which stock was issued |
| discount_amount | Money | Difference between par and issue price |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
