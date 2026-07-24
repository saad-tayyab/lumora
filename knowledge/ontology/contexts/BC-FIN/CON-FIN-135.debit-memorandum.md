---
id: CON-FIN-135
name: Debit Memorandum
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

# Debit Memorandum

## Definition

A document sent by a buyer to a seller notifying the seller that the buyer's accounts payable is being debited (reduced) due to a return or allowance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| purpose | string | Notifies seller of return or price allowance request |
| issued_by | string | Buyer |
| issued_to | string | Seller (creditor) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
