---
id: CON-FIN-419
name: Unit Cost
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

# Unit Cost

## Definition

The total cost of a job divided by the number of units produced, used for pricing, comparison, and efficiency analysis.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| formula | string | Unit Cost = Total Job Cost / Number of Units Produced |
| uses | string | Pricing decisions, cross-job comparison, variance analysis |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
