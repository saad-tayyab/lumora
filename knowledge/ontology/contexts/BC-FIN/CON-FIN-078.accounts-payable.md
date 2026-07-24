---
id: CON-FIN-078
name: Accounts Payable
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

# Accounts Payable

## Definition

Money owed by the business to creditors or vendors for goods or services purchased on credit, recorded as a liability with a normal credit balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| creditor_name | string | Name of the vendor or creditor |
| amount_owed | decimal | Outstanding balance owed |
| due_date | date | Date payment is due |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
