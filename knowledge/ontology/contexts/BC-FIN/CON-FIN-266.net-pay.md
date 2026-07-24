---
id: CON-FIN-266
name: Net Pay
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

# Net Pay

## Definition

The amount paid to the employee after all deductions from gross pay. Also called take-home pay.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Gross pay minus all deductions |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
