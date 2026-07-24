---
id: CON-FIN-148
name: Credit Memorandum
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

# Credit Memorandum

## Definition

A document sent by a seller to a buyer indicating the seller's intent to credit (reduce) the buyer's accounts receivable.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| purpose | string | Notifies buyer of allowance or return credit |
| issued_by | string | Seller |
| issued_to | string | Buyer (customer) |
| effect | entry | Debit Customer Refunds Payable, credit Accounts Receivable |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
