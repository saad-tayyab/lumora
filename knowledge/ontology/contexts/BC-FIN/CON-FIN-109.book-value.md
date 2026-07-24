---
id: CON-FIN-109
name: Book Value
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

# Book Value

## Definition

The net amount at which a fixed asset is reported on the balance sheet, calculated as the asset's original cost minus its accumulated depreciation.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| asset | string | The fixed asset |
| cost | decimal | Original historical cost of the asset |
| accumulated_depreciation | decimal | Total depreciation recorded to date |
| book_value | decimal | Cost minus accumulated depreciation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
