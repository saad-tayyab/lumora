---
id: CON-CASH-014
name: ReconcileAccount
context: BC-CASH
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - cash
  - treasury
  - command
  - reconciliation
---

# ReconcileAccount

## Definition
A command representing the intent to reconcile a bank statement against internal financial records. Initiates the reconciliation workflow including automatic matching, tolerance checking, and manual review. The command triggers the reconciliation process for a specific statement.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| statement_id | UUID v7 | yes | Statement to reconcile |
| bank_account_id | UUID v7 | yes | Account being reconciled |
| tolerance_amount | numeric(19,4) | no | Custom tolerance amount (uses default if not provided) |
| auto_match | boolean | no | Whether to attempt automatic matching (default: true) |
| exclude_unmatched | boolean | no | Whether to exclude unmatched entries (default: false) |
| reconciled_by | UUID v7 | yes | User performing reconciliation |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-003 (BankStatement) | targets | 1:1 | Command targets this statement |
| CON-CASH-004 (ReconciliationEntry) | processes | 1:N | Entries to reconcile |
| CON-CASH-011 (ReconciliationCompleted) | triggers | 1:1 | Event emitted on completion |

## Invariants
- INV-CASH-033: Command must reference a valid statement.
- INV-CASH-034: Tolerance amount must be non-negative if provided.

## Business Rules
- BR-008: Bank reconciliation requires matching with tolerance — this command implements the reconciliation workflow.

## Events
- CON-CASH-011 (ReconciliationCompleted) — emitted when reconciliation finishes

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
