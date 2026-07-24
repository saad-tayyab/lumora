---
id: CON-FIN-230
name: Fixed Assets
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

# Fixed Assets

## Definition

Long-term tangible assets used in the normal operations of a business, such as machinery, equipment, buildings, land, and land improvements. Also called property, plant, and equipment.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| initial_cost | decimal | Purchase price plus all costs to obtain and ready the asset for use |
| useful_life | integer | Estimated length of time the asset will be used in normal operations |
| residual_value | decimal | Estimated value of the asset at the end of its useful life |
| book_value | decimal | Cost less accumulated depreciation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
