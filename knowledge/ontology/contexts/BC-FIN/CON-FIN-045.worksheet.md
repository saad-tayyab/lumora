---
id: CON-FIN-045
name: Worksheet
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

# Worksheet

## Definition

A multi-column document used by accountants to assemble and summarize the data needed to prepare financial statements, typically with columns for unadjusted trial balance, adjustments, adjusted trial balance, income statement, and balance sheet.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| unadjusted_trial_balance | list | Account balances before adjustments |
| adjustments | list | Adjusting entries columns |
| adjusted_trial_balance | list | Account balances after adjustments |
| income_statement | list | Revenue and expense columns |
| balance_sheet | list | Asset, liability, and equity columns |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
