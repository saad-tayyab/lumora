---
id: CON-FIN-262
name: Discounted Note
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

# Discounted Note

## Definition

A note payable where interest (the discount) is deducted upfront. The borrower receives the face amount less the discount and must repay the full face amount at maturity.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_amount | decimal | Amount to be repaid at maturity |
| discount_rate | decimal | The discount rate applied |
| discount | decimal | Interest deducted upfront (face × rate × time) |
| proceeds | decimal | Amount received by borrower (face - discount) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
