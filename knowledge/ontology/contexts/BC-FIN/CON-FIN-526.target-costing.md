---
id: CON-FIN-526
name: Target Costing
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

# Target Costing

## Definition

A pricing method that starts with a competitive market selling price and subtracts the desired profit margin to determine the target cost, driving cost-reduction efforts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| market_selling_price | decimal | Competitive selling price estimated from the market |
| desired_profit_margin | decimal | Required profit margin on selling price or markup on cost |
| target_cost | decimal | Market price minus desired profit; the cost must be reduced to this level |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
