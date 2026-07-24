---
id: CON-FIN-225
name: Recovery of Bad Debt
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Recovery of Bad Debt

## Definition

The collection of an account receivable that had previously been written off as uncollectible. Requires two entries: (1) reinstate the receivable, and (2) record the cash collection.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| customer | String | Customer making the payment |
| amount | Money | Amount recovered |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
