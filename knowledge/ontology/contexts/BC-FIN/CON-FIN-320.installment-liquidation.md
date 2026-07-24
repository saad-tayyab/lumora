---
id: CON-FIN-320
name: Installment Liquidation
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Installment Liquidation

## Definition

A liquidation process where assets are sold and cash distributed to partners in installments over multiple periods, rather than in a single transaction.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash_available | numeric | Cash available for distribution at each installment |
| safe_payment_computation | numeric | Amount safely distributable after assuming worst-case losses |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
