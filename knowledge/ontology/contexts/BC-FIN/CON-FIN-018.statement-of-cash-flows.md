---
id: CON-FIN-018
name: Statement of Cash Flows
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

# Statement of Cash Flows

## Definition

A summary of the cash receipts and cash payments for a specific period of time, such as a month or a year. Classifies cash flows into operating, investing, and financing activities.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| operating_activities | money | Cash flows from primary business operations |
| investing_activities | money | Cash flows from buying/selling long-term assets |
| financing_activities | money | Cash flows from owner investments, withdrawals, and borrowing |
| net_change | money | Net increase or decrease in cash |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
