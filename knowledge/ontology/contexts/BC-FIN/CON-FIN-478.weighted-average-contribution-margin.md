---
id: CON-FIN-478
name: Weighted Average Contribution Margin
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

# Weighted Average Contribution Margin

## Definition

The average contribution margin per unit across all products, weighted by the sales mix percentage. Used to compute break-even for multi-product companies.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| per_unit | decimal | Weighted average contribution margin per composite unit |
| computed_from | string | Sum of (unit contribution margin × sales mix percentage) for each product |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
