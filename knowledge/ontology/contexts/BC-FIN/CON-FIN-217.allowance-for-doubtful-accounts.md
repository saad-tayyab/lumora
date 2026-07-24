---
id: CON-FIN-217
name: Allowance for Doubtful Accounts
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Allowance for Doubtful Accounts

## Definition

A contra-asset account that reduces the carrying value of accounts receivable to net realizable value. It represents the estimated portion of receivables that will not be collected.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| balance | Money | Current credit balance representing estimated uncollectible accounts |
| type | String | Contra-asset (credit balance normal) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
