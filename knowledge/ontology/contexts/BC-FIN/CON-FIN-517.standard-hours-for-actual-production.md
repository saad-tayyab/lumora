---
id: CON-FIN-517
name: Standard Hours for Actual Production
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

# Standard Hours for Actual Production

## Definition

The standard quantity of direct labor hours that should have been used for the actual number of units produced, calculated as actual units produced multiplied by standard hours per unit.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| actual_units_produced | integer | Number of units actually produced |
| standard_hours_per_unit | decimal | Standard direct labor hours per unit |
| total_standard_hours | decimal | Total standard hours allowed |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
