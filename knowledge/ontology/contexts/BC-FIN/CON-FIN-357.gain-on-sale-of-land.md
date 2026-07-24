---
id: CON-FIN-357
name: Gain on Sale of Land
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

# Gain on Sale of Land

## Definition

A gain recognized on the income statement when land is sold for more than its book value. Under the direct method, this gain is excluded from operating activities because the full cash proceeds are reported as an investing activity.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| selling_price | decimal | Cash received from the sale |
| book_value | decimal | Carrying value of the land on the balance sheet |
| gain_amount | decimal | Selling price minus book value |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
