---
id: CON-FIN-477
name: Break-Even Analysis for Service Business
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Break-Even Analysis for Service Business

## Definition

Determining the number of service units that must be provided to break even, using CVP analysis adapted for service organizations.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| service_price_per_unit | decimal | Revenue per unit of service |
| variable_cost_per_unit | decimal | Variable cost per unit of service |
| total_fixed_costs | decimal | Fixed costs for the period |
| break_even_units | decimal | Service units needed to break even |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
