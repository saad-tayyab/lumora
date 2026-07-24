---
id: CON-FIN-208
name: Outstanding Checks
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

# Outstanding Checks

## Definition

Checks written by the company and recorded in its books but not yet paid by the bank. Deducted from the bank balance in the bank reconciliation.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cause | string | Time lag between check writing and bank payment |
| reconciliation_treatment | string | Deducted from bank statement balance |
| journal_entry_required | boolean | No journal entry needed by company |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
