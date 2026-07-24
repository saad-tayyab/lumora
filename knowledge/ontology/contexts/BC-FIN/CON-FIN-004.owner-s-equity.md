---
id: CON-FIN-004
name: Owner's Equity
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Owner's Equity

## Definition

The owner's claim on the total assets of the business. Also called proprietor's equity or capital. Equals Assets minus Liabilities.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| capital | money | Owner's investment in the business |
| drawing | money | Owner withdrawals from the business |
| net_income | money | Revenue minus expenses for the period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
