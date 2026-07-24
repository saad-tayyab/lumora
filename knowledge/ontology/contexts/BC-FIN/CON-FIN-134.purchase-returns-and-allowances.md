---
id: CON-FIN-134
name: Purchase Returns and Allowances
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Purchase Returns and Allowances

## Definition

Reductions in the amount owed by a buyer to a seller for merchandise returned (purchase return) or for damaged/defective merchandise kept (purchase allowance).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| debit_memo | document | Document sent by buyer to notify seller of return or allowance |
| accounting_entry | entry | Debit Accounts Payable, credit Inventory (perpetual system) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
