---
id: CON-FIN-221
name: Percent of Sales Method
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

# Percent of Sales Method

## Definition

An estimation method for uncollectible accounts in which bad debt expense is calculated as a fixed percentage of credit sales for the period. The existing allowance balance is ignored when computing the adjusting entry.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| basis | String | Credit sales (or total sales if credit ratio is constant) |
| percentage | Decimal | Estimated bad debt percentage |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
