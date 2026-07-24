---
id: CON-FIN-534
name: Target Cost
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

# Target Cost

## Definition

The maximum allowable cost for a product, computed as the competitive market selling price minus the desired profit margin, used to drive cost-reduction engineering efforts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| market_price | decimal | Competitive selling price determined by market conditions |
| desired_profit_margin | decimal | Required profit margin as a percentage of selling price or cost |
| target_cost | decimal | Market price minus desired profit |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
