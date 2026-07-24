---
id: CON-FIN-533
name: Desired Profit
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

# Desired Profit

## Definition

The profit level management seeks to earn, typically computed as a desired return percentage multiplied by invested assets.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| desired_return_percentage | decimal | Required rate of return on invested assets |
| invested_assets | decimal | Total assets invested in the product or business |
| desired_profit_amount | decimal | Desired return percentage multiplied by invested assets |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
