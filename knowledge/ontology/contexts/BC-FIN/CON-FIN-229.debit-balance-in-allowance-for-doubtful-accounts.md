---
id: CON-FIN-229
name: Debit Balance in Allowance for Doubtful Accounts
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

# Debit Balance in Allowance for Doubtful Accounts

## Definition

An unusual balance in the Allowance for Doubtful Accounts that occurs when write-offs during the period exceed the prior estimated allowance. Requires a larger adjusting entry to bring the account to the desired credit balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cause | String | Write-offs exceeded prior allowance estimates |
| impact | String | Adjusting entry must cover the debit balance plus reach the target credit balance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
