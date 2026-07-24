---
id: CON-FIN-509
name: Direct Labor Time Variance
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

# Direct Labor Time Variance

## Definition

The difference between the actual direct labor hours used and the standard hours allowed for the actual production, multiplied by the standard hourly rate.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| actual_hours | decimal | Actual direct labor hours used |
| standard_hours | decimal | Standard hours allowed for actual production |
| standard_rate | decimal | Standard hourly wage rate |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
