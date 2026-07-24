---
id: CON-FIN-070
name: Limited Liability Company (LLC)
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

# Limited Liability Company (LLC)

## Definition

A business form that combines the limited liability features of a corporation with the tax benefits and flexibility of a partnership, with owners called members.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| members | member[] | The individuals or entities that own the LLC |
| member_equity_accounts | account[] | Equity accounts for each member, equivalent to capital accounts |
| operating_agreement | document | The governing document for the LLC |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
