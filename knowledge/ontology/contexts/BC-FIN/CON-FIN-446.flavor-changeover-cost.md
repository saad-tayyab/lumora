---
id: CON-FIN-446
name: Flavor Changeover Cost
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

# Flavor Changeover Cost

## Definition

The cost of cleaning and reconfiguring production machinery when switching between different product variants (flavors). A batch-level cost that varies with the number of production runs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| changeover_frequency | integer | Number of changeovers during the period |
| cost_per_changeover | decimal | Cost incurred per changeover |
| total_changeover_cost | decimal | Total changeover costs for the period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
