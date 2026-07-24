---
id: CON-FIN-345
name: Non-Cash Adjustment
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

# Non-Cash Adjustment

## Definition

An item included in net income that does not involve cash, such as depreciation expense, which is added back in the indirect method.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| item_name | string | Name of the non-cash item |
| amount | Money | Amount to add or deduct from net income |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
