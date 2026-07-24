---
id: CON-FIN-106
name: Notes Payable
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

# Notes Payable

## Definition

A written promise to pay a specified amount at a definite future date. May be issued to purchase assets or to settle accounts payable. Can be interest-bearing or discounted.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_amount | decimal | The principal amount of the note |
| interest_rate | decimal | The stated interest rate |
| term_days | integer | Duration of the note in days |
| issue_date | date | Date the note was issued |
| maturity_date | date | Date the note is due |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
