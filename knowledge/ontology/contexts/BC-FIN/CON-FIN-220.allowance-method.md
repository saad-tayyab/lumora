---
id: CON-FIN-220
name: Allowance Method
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

# Allowance Method

## Definition

A method of accounting for uncollectible accounts in which bad debt expense is estimated and recorded in the same period as the related revenue. Uses an Allowance for Doubtful Accounts contra-asset account.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| recognition_timing | String | Expense estimated and matched to revenue period |
| allowance_used | Boolean | Uses Allowance for Doubtful Accounts |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
