---
id: CON-FIN-275
name: Installment Note
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

# Installment Note

## Definition

A debt that requires the borrower to make equal periodic payments to the lender for the term of the note. Each payment includes both principal and interest components.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| principal_amount | decimal | Amount initially borrowed |
| interest_rate | decimal | Annual interest rate |
| term_years | integer | Number of years for repayment |
| periodic_payment | decimal | Equal payment amount each period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
