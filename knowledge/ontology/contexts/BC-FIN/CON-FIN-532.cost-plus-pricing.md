---
id: CON-FIN-532
name: Cost-Plus Pricing
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

# Cost-Plus Pricing

## Definition

A product pricing approach that determines the normal selling price by estimating a cost amount per unit and adding a markup based on desired profit.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_amount_per_unit | decimal | Estimated cost basis per unit |
| markup_percentage | decimal | Markup applied to cost amount |
| normal_selling_price | decimal | Cost amount plus markup per unit |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
