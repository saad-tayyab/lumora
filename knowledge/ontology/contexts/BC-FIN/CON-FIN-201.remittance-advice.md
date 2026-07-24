---
id: CON-FIN-201
name: Remittance Advice
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

# Remittance Advice

## Definition

A portion of the invoice returned by the customer with their payment. Serves as a record of cash initially received and ensures posting to customer accounts is for the correct amount.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| purpose | string | Record of cash received from customer payments |
| control_function | string | Ensures correct posting to customer accounts |
| usage | string | Returned with customer payments for bills |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
