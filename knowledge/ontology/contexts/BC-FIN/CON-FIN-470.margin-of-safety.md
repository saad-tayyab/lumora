---
id: CON-FIN-470
name: Margin of Safety
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

# Margin of Safety

## Definition

The excess of budgeted or actual sales over the break-even volume of sales. Indicates how much sales can drop before the company incurs a loss.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| dollars | decimal | Margin of safety in sales dollars |
| percentage | decimal | Margin of safety as a percentage of actual/budgeted sales |
| formula_dollars | string | Actual Sales - Break-Even Sales |
| formula_percentage | string | Margin of Safety Dollars / Actual Sales |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
