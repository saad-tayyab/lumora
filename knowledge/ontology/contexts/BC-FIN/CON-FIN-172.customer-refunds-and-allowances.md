---
id: CON-FIN-172
name: Customer Refunds and Allowances
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

# Customer Refunds and Allowances

## Definition

Estimated refunds and allowances granted to customers for returned merchandise or defective goods, recorded as an adjustment at period end to match revenues with expected returns.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| estimated_amount | decimal | Estimated total refunds and allowances |
| merchandise_return_cost | decimal | Estimated cost of returned merchandise |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
