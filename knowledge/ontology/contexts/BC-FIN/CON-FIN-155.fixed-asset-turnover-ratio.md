---
id: CON-FIN-155
name: Fixed Asset Turnover Ratio
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

# Fixed Asset Turnover Ratio

## Definition

A financial ratio that measures the number of sales dollars earned per dollar of fixed assets. Computed as Sales / Average Book Value of Fixed Assets. Higher ratio indicates more efficient use of fixed assets.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| sales | decimal | Net sales revenue for the period |
| average_book_value | decimal | Average of beginning and ending book value of fixed assets |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
