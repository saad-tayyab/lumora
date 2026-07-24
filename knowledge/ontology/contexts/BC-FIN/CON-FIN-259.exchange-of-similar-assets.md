---
id: CON-FIN-259
name: Exchange of Similar Assets
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

# Exchange of Similar Assets

## Definition

A transaction where old equipment is traded in for new equipment having a similar use. The accounting treatment depends on whether the exchange has commercial substance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| new_asset_cost | decimal | Fair market value of the new asset acquired |
| old_asset_cost | decimal | Historical cost of the old asset given up |
| old_asset_accumulated_depreciation | decimal | Total depreciation on old asset at exchange date |
| trade_in_allowance | decimal | Fair market value credit for old asset |
| cash_paid | decimal | Cash paid as boot |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
