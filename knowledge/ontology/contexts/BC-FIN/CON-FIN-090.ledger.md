---
id: CON-FIN-090
name: Ledger
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

# Ledger

## Definition

The book containing all accounts used by a business, arranged in account number order. Shows the increases, decreases, and balance of each account.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| accounts | list | All accounts of the business |
| order | string | Accounts arranged by account number |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
