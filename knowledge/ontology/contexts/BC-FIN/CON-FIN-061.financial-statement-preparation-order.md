---
id: CON-FIN-061
name: Financial Statement Preparation Order
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

# Financial Statement Preparation Order

## Definition

The order in which financial statements are prepared: Income Statement first, then Statement of Owner's Equity/Retained Earnings, then Balance Sheet, then Statement of Cash Flows.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| first | string | Income Statement |
| second | string | Statement of Owner's Equity or Retained Earnings |
| third | string | Balance Sheet |
| fourth | string | Statement of Cash Flows |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
