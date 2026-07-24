---
id: CON-FIN-210
name: Petty Cash Fund
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

# Petty Cash Fund

## Definition

A small amount of cash kept on hand for minor disbursements such as postage, office supplies, and miscellaneous expenses. The fund is established by writing a check, and replenished by submitting receipts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| fund_amount | Money | The established fixed amount of the petty cash fund |
| cash_on_hand | Money | Current cash remaining in the fund |
| receipts | List | Petty cash receipts documenting disbursements |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
