---
id: CON-FIN-203
name: Electronic Funds Transfer (EFT)
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

# Electronic Funds Transfer (EFT)

## Definition

The electronic transfer of money from one bank account to another, either within a single bank or across multiple institutions. Used for both cash receipts and cash payments.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| receipts_advantages | string | Lower cost, enhanced controls, reduced late payments |
| payments_usage | string | Payroll direct deposit, supplier payments, ATM withdrawals |
| ach_network | string | Network for clearing electronic funds transfers among individuals, companies, and banks |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
