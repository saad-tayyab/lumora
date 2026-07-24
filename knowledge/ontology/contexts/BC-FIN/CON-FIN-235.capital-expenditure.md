---
id: CON-FIN-235
name: Capital Expenditure
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

# Capital Expenditure

## Definition

Costs that improve the asset or extend its useful life. These are recorded as increases to the asset account (improvements) or decreases to accumulated depreciation (extraordinary repairs).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Cost of the capital expenditure |
| type | string | Either 'improvement' (debit asset) or 'extraordinary_repair' (debit accumulated depreciation) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
