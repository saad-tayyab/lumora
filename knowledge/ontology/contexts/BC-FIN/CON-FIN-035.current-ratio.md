---
id: CON-FIN-035
name: Current Ratio
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

# Current Ratio

## Definition

A liquidity ratio computed as current assets divided by current liabilities, measuring a company's ability to pay its current liabilities with its current assets.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| current_assets | decimal | Total current assets |
| current_liabilities | decimal | Total current liabilities |
| formula | string | Current Assets / Current Liabilities |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
