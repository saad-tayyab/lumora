---
id: CON-FIN-222
name: Analysis of Receivables Method
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

# Analysis of Receivables Method

## Definition

An estimation method for uncollectible accounts in which each receivable is aged and assigned to a class based on days past due. Each class is multiplied by an estimated uncollectible percentage. The result determines the desired ending balance of the Allowance for Doubtful Accounts.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| aging_classes | List | Categories such as not past due, 1-30, 31-60, 61-90, 91-180, 181-365, over 365 days |
| percentages | Map | Estimated uncollectible percentage per aging class |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
