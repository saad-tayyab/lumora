---
id: CON-FIN-342
name: Indirect Method
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

# Indirect Method

## Definition

A method of reporting cash flows from operating activities that adjusts net income for revenues and expenses that do not involve the receipt or payment of cash. Noncash expenses such as depreciation are added back, gains and losses on disposal of assets are adjusted, and changes in current operating assets and liabilities are added or subtracted.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| starting_point | string | Starts with net income or net loss |
| adjustments | array | Adjustments for noncash items and changes in working capital |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
