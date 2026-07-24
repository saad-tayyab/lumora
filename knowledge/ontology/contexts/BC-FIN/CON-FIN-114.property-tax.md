---
id: CON-FIN-114
name: Property Tax
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

# Property Tax

## Definition

An annual tax levied on property owned, typically paid in arrears and requiring an accrual adjustment at period end.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| assessed_value | decimal | Value of the property for tax purposes |
| tax_rate | decimal | Applicable tax rate |
| estimated_annual_amount | decimal | Estimated total tax for the year |
| portion_incurred | decimal | Amount of tax incurred to date |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
