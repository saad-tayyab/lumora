---
id: CON-AR-017
name: DunningPolicy
context: BC-AR
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - policy
  - dunning
  - collections
---

# DunningPolicy

## Definition

A business policy that governs the automated collection process for overdue invoices. When an invoice becomes overdue (InvoiceOverdue event), this policy determines the appropriate dunning actions based on the number of days past due, such as sending reminder emails, escalating to a collections team, or applying late fees.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string(100) | yes | Policy name |
| description | text | yes | Policy description |
| evaluation_type | enum | yes | Event-driven (on InvoiceOverdue) |
| is_active | boolean | yes | Whether the policy is currently active |
| dunning_levels | array | yes | Array of {days_overdue, action, template} defining escalation steps |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-012 (InvoiceOverdue) | triggers | — | Triggered by overdue invoice events |
| CON-AR-007 (AgingBucket) | uses | — | Uses aging buckets to determine escalation level |

## Invariants

- None.

## Business Rules

- None beyond invariants.

## Events

- DunningActionTriggered (when a dunning action is taken)

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
