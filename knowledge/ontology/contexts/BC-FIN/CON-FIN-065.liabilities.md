---
id: CON-FIN-065
name: Liabilities
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

# Liabilities

## Definition

Debts of a business, representing obligations to transfer assets or provide services to other entities in the future.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| accounts_payable | money | Amounts owed to suppliers |
| notes_payable | money | Written promises to pay |
| wages_payable | money | Amounts owed to employees |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
