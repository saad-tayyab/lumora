---
id: CON-FIN-209
name: NSF Check
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

# NSF Check

## Definition

A customer check that was initially deposited but returned by the bank because the customer had insufficient funds. The bank debits (reduces) the company's account for the amount of the bounced check.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cause | string | Customer's bank account had insufficient funds to cover the check |
| bank_treatment | string | Bank issues debit memo to reduce company's account |
| company_treatment | string | Company re-establishes accounts receivable from customer |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
