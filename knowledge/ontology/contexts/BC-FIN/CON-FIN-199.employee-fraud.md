---
id: CON-FIN-199
name: Employee Fraud
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

# Employee Fraud

## Definition

The intentional act of deceiving an employer for personal gain. Ranges from minor expense overstatement to stealing millions. Often involves adjusting accounting records to hide the fraud.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| prevalence | string | Organizations lose 5% of annual revenues worldwide to employee fraud |
| common_schemes | string | Cash receipts fraud (not recording receipts), cash payments fraud (false invoices) |
| detection | string | Often discovered when long-term employee misses work or through monitoring |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
