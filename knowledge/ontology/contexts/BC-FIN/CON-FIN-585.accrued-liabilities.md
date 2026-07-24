---
id: CON-FIN-585
name: Accrued Liabilities
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

# Accrued Liabilities

## Definition

Current liabilities representing obligations incurred but not yet paid, including compensation, sales-related reserves, endorsements, dividends payable, and other items.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| compensation_and_benefits | Money | Employee compensation excluding taxes |
| sales_related_reserves | Money | Estimated returns, discounts, and claims |
| endorsement_compensation | Money | Obligations to endorsed athletes and personalities |
| dividends_payable | Money | Declared but unpaid dividends to shareholders |
| other | Money | Miscellaneous accrued obligations |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
