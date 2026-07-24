---
id: CON-FIN-508
name: Direct Labor Rate Variance
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

# Direct Labor Rate Variance

## Definition

The difference between the actual hourly rate paid to direct labor workers and the standard hourly rate expected, multiplied by the actual hours worked.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| actual_rate | decimal | Actual hourly wage rate |
| standard_rate | decimal | Standard hourly wage rate |
| actual_hours | decimal | Actual direct labor hours worked |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
