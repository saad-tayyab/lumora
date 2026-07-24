---
id: CON-FIN-547
name: Complicating Factor — Income Tax
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Complicating Factor — Income Tax

## Definition

Income taxes impact capital investment analysis through differences between book and tax depreciation, affecting the timing and amount of cash flows.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| tax_depreciation | string | Depreciation method and useful life used for tax purposes |
| book_depreciation | string | Depreciation method used for financial reporting |
| tax_rate | decimal | Applicable income tax rate |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
