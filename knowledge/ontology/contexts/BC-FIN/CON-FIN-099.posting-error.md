---
id: CON-FIN-099
name: Posting Error
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

# Posting Error

## Definition

An error occurring when an amount is posted to the wrong account, in the wrong direction (debit instead of credit), or for the wrong amount during the transfer from journal to ledger.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| intended_account | string | The account that should have been affected |
| actual_account | string | The account that was incorrectly affected |
| intended_amount | decimal | The correct amount |
| posted_amount | decimal | The incorrect amount posted |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
