---
id: CON-FIN-132
name: Credit Terms
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

# Credit Terms

## Definition

The conditions of a sale specifying the discount percentage, discount period, and full payment due date. Example: 2/10, n/30 means a 2% discount if paid within 10 days, otherwise the net amount is due in 30 days.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| discount_percentage | decimal | Percentage discount for early payment |
| discount_period_days | integer | Number of days to take the discount |
| net_period_days | integer | Number of days until full payment is due |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
