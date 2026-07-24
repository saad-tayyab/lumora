---
id: CON-FIN-497
name: Capital Expenditures Budget
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Capital Expenditures Budget

## Definition

A budget that plans for the acquisition of long-term assets such as equipment, buildings, and land.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| asset_description | string | Description of the asset to be acquired |
| estimated_cost | number | Expected cost of the asset |
| acquisition_timing | string | When the asset is expected to be purchased |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
