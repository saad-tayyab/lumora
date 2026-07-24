---
id: CON-FIN-313
name: Asset Revaluation
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Asset Revaluation

## Definition

The adjustment of partnership assets to their current fair market values when a new partner is admitted or an existing partner's interest changes, with gains or losses allocated to existing partners' capital accounts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| asset_name | string | The asset being revalued |
| book_value | numeric | The current recorded value of the asset |
| fair_market_value | numeric | The current market value of the asset |
| revaluation_gain_or_loss | numeric | The difference between fair value and book value |
| allocated_to_partners | allocation[] | How the gain or loss is divided among existing partners |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
