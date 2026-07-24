---
id: CON-FIN-332
name: Premium on Stock
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

# Premium on Stock

## Definition

The amount by which the issue price of stock exceeds its par or stated value. Credited to Paid-In Capital in Excess of Par.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| par_value | Money | Par value per share |
| issue_price | Money | Price at which stock was issued |
| premium_amount | Money | Excess of issue price over par |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
