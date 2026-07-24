---
id: CON-FIN-556
name: Currency Exchange Rate Impact
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

# Currency Exchange Rate Impact

## Definition

The effect of changes in foreign currency exchange rates on the profitability and internal rate of return of international capital investments.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| local_currency | string | Currency of the foreign country |
| exchange_rate | decimal | Conversion rate between local and home currency |
| revenue_currency | string | Currency in which revenues are received |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
