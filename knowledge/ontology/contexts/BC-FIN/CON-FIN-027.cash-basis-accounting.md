---
id: CON-FIN-027
name: Cash Basis Accounting
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

# Cash Basis Accounting

## Definition

An accounting method where revenues are recorded only when cash is received and expenses are recorded only when cash is paid. Not in accordance with GAAP for most businesses.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| revenue_recognition | rule | Record revenue only when cash received |
| expense_recognition | rule | Record expense only when cash paid |
| gaap_compliance | boolean | Not GAAP-compliant for most businesses |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
