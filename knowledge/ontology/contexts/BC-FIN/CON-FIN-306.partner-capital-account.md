---
id: CON-FIN-306
name: Partner Capital Account
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

# Partner Capital Account

## Definition

An equity account reflecting a partner's ownership interest in the partnership, credited for investments and share of income, debited for withdrawals and share of losses.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| partner_name | string | The name of the partner |
| beginning_balance | numeric | Capital balance at the start of the period |
| investments | numeric | Additional capital contributions during the period |
| share_of_income | numeric | Partner's share of net income |
| withdrawals | numeric | Amounts withdrawn by the partner during the period |
| ending_balance | numeric | Capital balance at the end of the period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
