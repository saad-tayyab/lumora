---
id: CON-FIN-133
name: Purchase Discount
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

# Purchase Discount

## Definition

A discount taken by a buyer for paying an invoice within the discount period, reducing the cost of merchandise purchased.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| formula | string | Discount = Invoice Amount × Discount Percentage |
| effective_annual_rate | percentage | Annualized cost of not taking the discount (e.g., 2% for 20 days ≈ 36.5%) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
