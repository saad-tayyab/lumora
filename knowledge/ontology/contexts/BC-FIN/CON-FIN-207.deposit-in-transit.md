---
id: CON-FIN-207
name: Deposit in Transit
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

# Deposit in Transit

## Definition

A deposit made by the company but not yet recorded by the bank on the bank statement. Added to the bank balance in the bank reconciliation.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cause | string | Time lag between company mailing/depositing and bank recording |
| reconciliation_treatment | string | Added to bank statement balance |
| journal_entry_required | boolean | No journal entry needed by company |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
