---
id: CON-FIN-280
name: Maturity Value
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Maturity Value

## Definition

The total amount due at the maturity of a note, equal to the face amount plus interest, or the face amount for a discounted note.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_amount | decimal | The principal amount of the note |
| interest | decimal | Total interest accrued (for interest-bearing notes) |
| total | decimal | The sum due at maturity |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
