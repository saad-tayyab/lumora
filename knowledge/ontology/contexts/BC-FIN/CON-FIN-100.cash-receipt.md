---
id: CON-FIN-100
name: Cash Receipt
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

# Cash Receipt

## Definition

A transaction involving the receipt of cash, recorded as a debit to Cash and a credit to the source account (e.g., Fees Earned, Accounts Receivable).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Amount of cash received |
| source | string | The reason for or source of the cash receipt |
| date | date | Date the cash was received |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
