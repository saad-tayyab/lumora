---
id: CON-FIN-596
name: Sales Discount
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

# Sales Discount

## Definition

From the seller's perspective, a discount that a seller may offer the buyer for early payment.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| discount_percentage | number | Percentage discount offered |
| discount_period | number | Days within which discount applies |
| credit_period | number | Total credit period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
