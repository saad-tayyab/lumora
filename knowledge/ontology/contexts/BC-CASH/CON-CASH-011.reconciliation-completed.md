---
id: CON-CASH-011
name: ReconciliationCompleted
context: BC-CASH
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - cash
  - treasury
  - event
  - reconciliation
---

# ReconciliationCompleted

## Definition
A domain event emitted when a bank statement reconciliation process has been completed. All entries in the statement have been matched, excluded, or marked as disputed. This event triggers downstream processes such as financial reporting and variance analysis.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| statement_id | UUID v7 | yes | Reference to reconciled BankStatement |
| bank_account_id | UUID v7 | yes | Account that was reconciled |
| total_entries | integer | yes | Total entries in statement |
| matched_count | integer | yes | Number of successfully matched entries |
| excluded_count | integer | yes | Number of excluded entries |
| disputed_count | integer | yes | Number of disputed entries |
| reconciled_by | UUID v7 | yes | User who completed reconciliation |
| occurred_at | timestamp | yes | When reconciliation completed |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-003 (BankStatement) | triggers | 1:1 | Event for this statement |

## Invariants
- INV-CROSS-003: Event must have a globally unique identifier (UUID v7).
- INV-CASH-026: Reconciliation completed event must reference a valid statement.

## Business Rules
- INV-CROSS-002: Cross-context communication happens through domain events only.

## Events
- This is an event (does not emit other events)

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#44-cross-context-invariants)
