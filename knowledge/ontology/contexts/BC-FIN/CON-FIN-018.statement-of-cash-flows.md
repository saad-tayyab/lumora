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

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-015 (Income Statement) | uses | N:1 | Statement of cash flows uses income statement data for operating activities |
| CON-FIN-017 (Consolidated Balance Sheet) | uses | N:1 | Ending cash must match balance sheet cash balance |
| CON-FIN-014 (Adjusted Trial Balance) | uses | N:1 | Uses adjusted trial balance data for cash flow classification |
| CON-FIN-085 (Account) | uses | N:M | References cash and related accounts for flow classification |
| CON-FIN-055 (Fiscal Year) | belongs-to | N:1 | Cash flows are reported over a fiscal period |

## Invariants

- INV-FIN-001: Net change in cash plus beginning cash must equal ending cash balance.
- INV-FIN-003: Every financial statement must have an audit trail.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).

## Business Rules

- BR-097: Cash flows classification — cash flows are classified into operating, investing, and financing activities.
- BR-303: Cash flows classified into three activities — operating, investing, and financing.
- BR-304: Ending cash must match balance sheet.
- BR-305: Indirect method adjusts net income to cash basis.
- BR-309: Statement of cash flows order — operating, investing, then financing sections.
- BR-314: Free cash flow computation.
- BR-315: Ending cash reconciliation.

## Events

- CashFlowStatementGenerated
- CashPositionReported
- PeriodClosed

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Invariants](../../constitution/DOMAIN.md#4-domain-invariants)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
