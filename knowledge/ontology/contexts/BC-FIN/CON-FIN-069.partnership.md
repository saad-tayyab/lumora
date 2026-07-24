---
id: CON-FIN-069
name: Partnership
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Partnership

## Definition

An association of two or more persons who co-own a business for profit, sharing in its profits and losses according to a partnership agreement.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| partners | partner[] | The individuals or entities that own the partnership |
| partnership_agreement | document | The legal document outlining the terms of the partnership |
| capital_accounts | account[] | Individual equity accounts for each partner |
| drawing_accounts | account[] | Accounts tracking partner withdrawals during the period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
