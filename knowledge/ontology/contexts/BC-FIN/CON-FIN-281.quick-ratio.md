---
id: CON-FIN-281
name: Quick Ratio
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

# Quick Ratio

## Definition

A more stringent liquidity ratio measuring ability to pay short-term obligations without relying on inventory sales, calculated as (Cash + Short-term Investments + Receivables) divided by Current Liabilities.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| quick_assets | Money | Cash, short-term investments, and accounts receivable |
| ratio | Float | Quick assets divided by current liabilities |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
