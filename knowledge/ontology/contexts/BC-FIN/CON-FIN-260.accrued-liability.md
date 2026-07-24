---
id: CON-FIN-260
name: Accrued Liability
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

# Accrued Liability

## Definition

An obligation to pay current assets in the future, recorded at the end of an accounting period as part of the adjustment process. Examples include wages payable and interest payable.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Amount accrued and owed |
| accrual_date | date | Date the accrual was recorded |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
