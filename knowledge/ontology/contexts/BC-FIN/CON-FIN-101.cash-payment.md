---
id: CON-FIN-101
name: Cash Payment
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

# Cash Payment

## Definition

A transaction involving the disbursement of cash, recorded as a credit to Cash and a debit to the destination account (e.g., Expenses, Accounts Payable).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Amount of cash paid |
| purpose | string | The reason for the cash payment |
| date | date | Date the cash was paid |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
