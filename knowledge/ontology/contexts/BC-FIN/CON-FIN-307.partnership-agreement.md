---
id: CON-FIN-307
name: Partnership Agreement
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

# Partnership Agreement

## Definition

A legal document that establishes the terms under which a partnership will operate, including capital contributions, income division, roles, and dissolution procedures.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| partner_contributions | contribution[] | Each partner's initial investment |
| income_sharing_formula | formula | How net income and losses are divided among partners |
| salary_allowances | allowance[] | Annual or monthly salary allowances for working partners |
| interest_allowances | allowance[] | Interest on partners' capital balances |
| drawing_limits | limit[] | Limits on partner withdrawals |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
