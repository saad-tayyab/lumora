---
id: CON-FIN-068
name: Net Loss
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

# Net Loss

## Definition

The excess of expenses over revenue for a period of time. Decreases owner's equity.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | money | Expenses minus revenue |
| period | date_range | Time period for the calculation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
