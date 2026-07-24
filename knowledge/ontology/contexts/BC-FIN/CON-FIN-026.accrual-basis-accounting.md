---
id: CON-FIN-026
name: Accrual Basis Accounting
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Accrual Basis Accounting

## Definition

An accounting method where revenues are recognized when earned (regardless of when cash is received) and expenses are recognized when incurred (regardless of when cash is paid). Required by GAAP.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| revenue_recognition | rule | Record revenue when earned |
| expense_recognition | rule | Record expense when incurred |
| gaap_required | boolean | Required by generally accepted accounting principles |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
