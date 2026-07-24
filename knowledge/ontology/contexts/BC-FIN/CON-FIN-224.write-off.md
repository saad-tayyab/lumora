---
id: CON-FIN-224
name: Write-Off
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

# Write-Off

## Definition

The removal of an uncollectible account receivable from the books. Under the allowance method, the write-off debits Allowance for Doubtful Accounts and credits Accounts Receivable. Under the direct write-off method, it debits Bad Debt Expense and credits Accounts Receivable.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| customer | String | Customer whose account is being written off |
| amount | Money | Amount being written off |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
