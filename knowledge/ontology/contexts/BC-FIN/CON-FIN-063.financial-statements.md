---
id: CON-FIN-063
name: Financial Statements
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Financial Statements

## Definition

Reports that summarize the financial condition and performance of a business, prepared in a specific order: Income Statement, Statement of Owner's Equity, Balance Sheet, and Statement of Cash Flows.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| order | integer | The specific order in which statements must be prepared (1-Income Statement, 2-Statement of Owner's Equity, 3-Balance Sheet, 4-Statement of Cash Flows) |
| period | date_range | The time period covered by the statements |
| date | date | Specific date for balance sheet data |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
