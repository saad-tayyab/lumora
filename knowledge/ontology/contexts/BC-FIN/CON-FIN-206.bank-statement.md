---
id: CON-FIN-206
name: Bank Statement
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

# Bank Statement

## Definition

A summary of all checking account transactions maintained by the bank and sent to the company (depositor) each month. Indicates the beginning balance, additions, deductions, and the ending balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| beginning_balance | string | Cash balance at start of period |
| additions | string | Deposits and credit memos |
| deductions | string | Checks paid, debit memos, and service charges |
| ending_balance | string | Cash balance at end of period |
| credit_memos | string | Increase company's account (EFT deposits, note collections, interest) |
| debit_memos | string | Decrease company's account (EFT payments, service charges, NSF checks) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
