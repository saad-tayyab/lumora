---
id: CON-FIN-212
name: Compensating Balance
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

# Compensating Balance

## Definition

A minimum cash balance that a bank may require a company to maintain in its bank account, often required as part of a loan agreement or line of credit. Must be disclosed in notes to the financial statements.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| requirement_source | string | Typically required by bank as part of loan agreement or line of credit |
| disclosure | string | Must be disclosed in notes to financial statements |
| restriction | string | Reduces cash available for other uses |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
