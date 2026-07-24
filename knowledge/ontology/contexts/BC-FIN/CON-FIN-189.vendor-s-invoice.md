---
id: CON-FIN-189
name: Vendor's Invoice
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

# Vendor's Invoice

## Definition

A bill from the seller requesting payment for merchandise sold. It is compared to the purchase order and receiving report to ensure accuracy before payment is authorized.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| invoice_amount | decimal | Total amount billed |
| terms | string | Payment terms and conditions |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
