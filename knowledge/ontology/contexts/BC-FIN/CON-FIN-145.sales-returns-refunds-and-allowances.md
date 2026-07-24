---
id: CON-FIN-145
name: Sales Returns, Refunds, and Allowances
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Sales Returns, Refunds, and Allowances

## Definition

Reductions in revenue when customers return merchandise, receive cash refunds, or are granted price allowances for defective or damaged goods.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash_refund | entry | Debit Customer Refunds Payable, credit Cash |
| credit_memo | entry | Debit Customer Refunds Payable, credit Accounts Receivable |
| inventory_return | entry | Debit Inventory, credit Estimated Returns Inventory |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
