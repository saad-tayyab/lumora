---
id: CON-FIN-348
name: Free Cash Flow
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

# Free Cash Flow

## Definition

A measure of operating cash flow available to a company after it purchases the property, plant, and equipment necessary to maintain its current operations. Computed as net cash flows from operating activities minus cash used to purchase property, plant, and equipment.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| operating_cash_flow | decimal | Net cash flows from operating activities |
| capital_expenditures | decimal | Cash used for purchasing PP&E |
| formula | string | Net cash from operating activities - Capital expenditures |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
