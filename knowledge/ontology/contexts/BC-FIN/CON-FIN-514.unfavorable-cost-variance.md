---
id: CON-FIN-514
name: Unfavorable Cost Variance
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

# Unfavorable Cost Variance

## Definition

A variance that occurs when actual costs exceed standard costs at the actual volume of production.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| variance_amount | number | The amount by which actual cost exceeds standard cost |
| journal_entry_effect | string | Recorded as a debit (increase in costs) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
