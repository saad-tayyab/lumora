---
id: CON-FIN-236
name: Revenue Expenditure
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

# Revenue Expenditure

## Definition

A cost that does not provide a future benefit beyond the current period and is therefore recorded as an expense. Includes repairs and maintenance, and costs from errors or damage.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | Money | Amount expensed in the current period |
| criteria | String | Does not extend useful life or improve asset beyond original condition |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
