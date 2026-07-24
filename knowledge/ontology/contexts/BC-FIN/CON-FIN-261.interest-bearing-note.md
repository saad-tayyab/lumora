---
id: CON-FIN-261
name: Interest-Bearing Note
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

# Interest-Bearing Note

## Definition

A note payable where the borrower receives the face amount and repays the face amount plus interest at maturity.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_amount | decimal | Principal amount borrowed |
| stated_rate | decimal | Annual interest rate on the note |
| proceeds | decimal | Amount received by borrower (equals face amount) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
