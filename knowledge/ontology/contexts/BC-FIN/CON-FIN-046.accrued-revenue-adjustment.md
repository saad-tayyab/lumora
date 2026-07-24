---
id: CON-FIN-046
name: Accrued Revenue Adjustment
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

# Accrued Revenue Adjustment

## Definition

An adjusting entry that records revenue that has been earned but not yet billed or received, creating a receivable and recognizing revenue.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| receivable_account | string | The asset account for amounts owed (e.g., Accounts Receivable) |
| revenue_account | string | The revenue account being increased |
| amount_earned | decimal | Revenue earned but not yet recorded |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
