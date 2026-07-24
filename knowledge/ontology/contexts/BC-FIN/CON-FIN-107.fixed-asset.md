---
id: CON-FIN-107
name: Fixed Asset
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Fixed Asset

## Definition

A long-term tangible asset used in the operations of a business, recorded at historical cost. Includes land, buildings, and equipment. Not intended for resale.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| name | string | Description of the asset |
| cost | decimal | Historical purchase price |
| acquisition_date | date | Date the asset was purchased |
| useful_life | integer | Estimated number of periods the asset will be used |
| residual_value | decimal | Estimated value at end of useful life |
| depreciable | boolean | Whether the asset is subject to depreciation (land is not) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
