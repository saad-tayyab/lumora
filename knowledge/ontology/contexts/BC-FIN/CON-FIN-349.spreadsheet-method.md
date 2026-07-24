---
id: CON-FIN-349
name: Spreadsheet Method
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Spreadsheet Method

## Definition

An end-of-period spreadsheet (worksheet) used as an aid in assembling data for the statement of cash flows. It analyzes changes in noncash balance sheet accounts to classify transactions as operating, investing, or financing activities.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| balance_sheet_accounts | array | Noncash balance sheet accounts analyzed for changes |
| transaction_columns | array | Debit and Credit Transactions columns for classifying cash flows |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
