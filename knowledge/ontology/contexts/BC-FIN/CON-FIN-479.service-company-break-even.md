---
id: CON-FIN-479
name: Service Company Break-Even
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

# Service Company Break-Even

## Definition

Application of CVP analysis to service businesses where revenue is generated from subscriptions, accounts, or service contracts rather than product sales. Fixed costs include infrastructure and personnel; variable costs include per-account delivery costs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| revenue_per_account | decimal | Monthly or per-period revenue generated per customer account |
| variable_cost_per_account | decimal | Cost incurred per additional customer account |
| fixed_costs | decimal | Total fixed costs for the service operation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
