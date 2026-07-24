---
id: CON-FIN-276
name: Mortgage Note
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

# Mortgage Note

## Definition

An installment note secured by a specific asset (usually property). If the borrower fails to pay, the lender can seize and sell the pledged asset.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| collateral | string | The asset securing the note |
| principal_amount | decimal | Amount borrowed |
| interest_rate | decimal | Annual interest rate |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
