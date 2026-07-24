---
id: CON-FIN-142
name: Sales (Revenue)
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Sales (Revenue)

## Definition

Revenue from merchandise sales to customers for cash or on account. Reported on the income statement.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| alternate_names | list | Sales Revenue, Sales of Merchandise |
| temporary | boolean | Closed at period end |
| debit_adjustments | list | Sales returns, allowances, discounts reduce sales |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
