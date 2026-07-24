---
id: CON-FIN-513
name: Favorable Cost Variance
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

# Favorable Cost Variance

## Definition

A variance that occurs when actual costs are less than standard costs at the actual volume of production.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| variance_amount | number | The amount by which actual cost is less than standard cost |
| journal_entry_effect | string | Recorded as a credit (decrease in costs) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
