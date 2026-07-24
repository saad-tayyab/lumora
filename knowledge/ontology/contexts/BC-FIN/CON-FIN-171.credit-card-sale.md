---
id: CON-FIN-171
name: Credit Card Sale
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

# Credit Card Sale

## Definition

A sale where the customer pays using a credit card (Mastercard, Visa, American Express). The seller deposits the sales slip with a clearing house bank and receives payment minus a service fee.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| card_type | string | Type of credit card used |
| service_fee | decimal | Fee charged by credit card processor |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
