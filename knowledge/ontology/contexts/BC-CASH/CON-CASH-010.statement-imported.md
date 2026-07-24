---
id: CON-CASH-010
name: StatementImported
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
  - statement
  - import
---

# StatementImported

## Definition
A domain event emitted when a bank statement has been successfully imported into the system. This event signals that statement data is available for reconciliation and triggers downstream processes such as automatic matching and reconciliation workflows.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| statement_id | UUID v7 | yes | Reference to the imported BankStatement |
| bank_account_id | UUID v7 | yes | Account the statement belongs to |
| period_start | date | yes | Statement period start |
| period_end | date | yes | Statement period end |
| transaction_count | integer | yes | Number of transactions imported |
| import_source | string(20) | yes | Source of import (API, CSV, OFX) |
| imported_by | UUID v7 | yes | User who imported the statement |
| occurred_at | timestamp | yes | When the import completed |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-003 (BankStatement) | triggers | 1:1 | Event for this statement |

## Invariants
- INV-CROSS-003: Event must have a globally unique identifier (UUID v7).
- INV-CASH-025: Statement import event must reference a valid statement.

## Business Rules
- INV-CROSS-002: Cross-context communication happens through domain events only.

## Events
- This is an event (does not emit other events)

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#44-cross-context-invariants)
