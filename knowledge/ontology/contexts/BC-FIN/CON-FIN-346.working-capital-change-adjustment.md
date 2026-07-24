---
id: CON-FIN-346
name: Working Capital Change Adjustment
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

# Working Capital Change Adjustment

## Definition

Adjustments in the indirect method for changes in current operating assets and liabilities (e.g., increase in accounts receivable is deducted from net income).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| account_name | string | Current asset or liability account |
| change_amount | Money | Increase or decrease in the account |
| adjustment_direction | string | Add to or deduct from net income |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
