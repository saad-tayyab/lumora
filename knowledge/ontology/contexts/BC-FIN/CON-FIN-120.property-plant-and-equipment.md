---
id: CON-FIN-120
name: Property Plant and Equipment
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

# Property Plant and Equipment

## Definition

Long-lived tangible assets used in the operations of a business, reported at book value (cost minus accumulated depreciation).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| asset_name | string | Name of the asset |
| cost | decimal | Original acquisition cost |
| accumulated_depreciation | decimal | Total depreciation to date |
| book_value | decimal | Cost minus accumulated depreciation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
