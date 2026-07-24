---
id: CON-FIN-095
name: Unearned Revenue Adjustment
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

# Unearned Revenue Adjustment

## Definition

An adjusting entry that recognizes revenue that has been earned from a previously recorded liability (unearned revenue), reducing the liability and increasing revenue.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| liability_account | string | The unearned revenue account being reduced |
| revenue_account | string | The revenue account being increased |
| amount_earned | decimal | Portion of unearned revenue now earned |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
