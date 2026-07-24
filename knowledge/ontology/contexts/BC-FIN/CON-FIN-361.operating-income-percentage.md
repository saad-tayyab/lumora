---
id: CON-FIN-361
name: Operating Income Percentage
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

# Operating Income Percentage

## Definition

The ratio of operating income to sales, expressed as a percentage. It measures profitability from core business operations before interest and taxes.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| operating_income | decimal | Gross profit minus operating expenses |
| sales | decimal | Net sales revenue |
| formula | string | Operating Income / Sales × 100 |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
