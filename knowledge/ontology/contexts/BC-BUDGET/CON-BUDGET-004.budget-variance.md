---
id: CON-BUDGET-004
name: Budget Variance
context: BC-BUDGET
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - budget
  - variance
  - value-object
---

# Budget Variance

## Definition

An immutable value object representing the difference between budgeted and actual amounts for a budget line within a period. Computed on demand from the budget line's budget and consumed amounts.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| budgetLineId | UUID v7 | yes | Reference to the Budget Line |
| budgetedAmount | decimal(19,4) | yes | Original budget allocation |
| actualAmount | decimal(19,4) | yes | Total consumed amount |
| varianceAmount | decimal(19,4) | yes | Difference (actual minus budgeted) |
| variancePercentage | decimal(7,4) | yes | Variance as percentage of budgeted amount |
| period | varchar(20) | yes | Period identifier for this variance |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-BUDGET-002 (Budget Line) | computed-from | N:1 | Variance is computed from a budget line |
| CON-BUDGET-001 (Budget Header) | belongs-to | N:1 | Variance belongs to a budget header |

## Business Rules

- BR-019: Budget variance is calculated as consumed minus budgeted amount

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-019
