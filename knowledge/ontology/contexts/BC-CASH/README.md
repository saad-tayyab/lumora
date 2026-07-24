---
id: BC-CASH
name: Cash & Treasury
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
last_updated: 2026-07-24
---

# BC-CASH: Cash & Treasury

## Overview

The Cash & Treasury bounded context manages all banking operations, cash movements, and bank reconciliation for the Lumora ERP system. It provides the infrastructure for tracking bank accounts, processing transfers, importing bank statements, and reconciling financial records.

## Bounded Context Definition

| Property | Value |
|----------|-------|
| **ID** | BC-CASH |
| **Name** | Cash & Treasury |
| **Description** | Bank accounts, transfers, reconciliation |
| **Aggregate Roots** | BankAccount, BankTransfer |
| **Domain Constitution** | [DOMAIN.md](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts) |

## Concepts

| ID | Name | Type | Description |
|----|------|------|-------------|
| CON-CASH-001 | BankAccount | aggregate | Financial account at a bank or institution |
| CON-CASH-002 | BankTransfer | aggregate | Movement of funds between accounts |
| CON-CASH-003 | BankStatement | entity | Imported bank statement with transactions |
| CON-CASH-004 | ReconciliationEntry | entity | Statement transaction for matching |
| CON-CASH-005 | ReconciliationMatch | value_object | Result of matching entry to internal record |
| CON-CASH-006 | Currency | value_object | ISO 4217 monetary currency |
| CON-CASH-007 | BankConnection | entity | API connection to financial institution |
| CON-CASH-008 | TransferCreated | event | Transfer initiated event |
| CON-CASH-009 | TransferCompleted | event | Transfer finished event |
| CON-CASH-010 | StatementImported | event | Statement imported event |
| CON-CASH-011 | ReconciliationCompleted | event | Reconciliation finished event |
| CON-CASH-012 | CreateTransfer | command | Intent to create transfer |
| CON-CASH-013 | ImportStatement | command | Intent to import statement |
| CON-CASH-014 | ReconcileAccount | command | Intent to reconcile account |
| CON-CASH-015 | ReconciliationTolerancePolicy | policy | Tolerance thresholds for matching |
| CON-CASH-016 | BankFeePolicy | policy | Fee detection and recording rules |

## Business Rules

| Rule ID | Rule | Priority |
|---------|------|----------|
| BR-008 | Bank reconciliation requires matching with tolerance | High |

## Domain Invariants

| Invariant | Description |
|-----------|-------------|
| INV-CASH-001 | Bank account balance must be numeric with decimal precision |
| INV-CASH-002 | Account number must be encrypted at rest |
| INV-CASH-003 | Soft deletion is mandatory for all entities |
| INV-CASH-004 | Transfer amount must be greater than zero |
| INV-CASH-005 | Source and destination accounts must be different |
| INV-CASH-006 | Transfer status must follow valid state machine |
| INV-CASH-007 | Completed transfers cannot be modified |

## Cross-Context Invariants

| Invariant | Description |
|-----------|-------------|
| INV-CROSS-001 | No bounded context may directly access another context's database tables |
| INV-CROSS-002 | Cross-context communication happens through domain events only |
| INV-CROSS-003 | Every entity must have a globally unique identifier (UUID v7) |

## Events

| Event | Source | Target Contexts | Payload |
|-------|--------|-----------------|---------|
| TransferCreated | BC-CASH | BC-FIN, BC-REPORT | TransferID, Amount, AccountIDs |
| TransferCompleted | BC-CASH | BC-FIN, BC-CASH | TransferID, CompletedAt |
| StatementImported | BC-CASH | BC-REPORT | StatementID, TransactionCount |
| ReconciliationCompleted | BC-CASH | BC-FIN, BC-REPORT | StatementID, MatchedCount |

## File Structure

```
BC-CASH/
├── README.md                              # This file
├── relationships.md                       # All relationships
├── constraints.md                         # All constraints
├── CON-CASH-001.bank-account.md          # BankAccount aggregate
├── CON-CASH-002.bank-transfer.md         # BankTransfer aggregate
├── CON-CASH-003.bank-statement.md        # BankStatement entity
├── CON-CASH-004.reconciliation-entry.md  # ReconciliationEntry entity
├── CON-CASH-005.reconciliation-match.md  # ReconciliationMatch value object
├── CON-CASH-006.currency.md              # Currency value object
├── CON-CASH-007.bank-connection.md       # BankConnection entity
├── CON-CASH-008.transfer-created.md      # TransferCreated event
├── CON-CASH-009.transfer-completed.md    # TransferCompleted event
├── CON-CASH-010.statement-imported.md    # StatementImported event
├── CON-CASH-011.reconciliation-completed.md # ReconciliationCompleted event
├── CON-CASH-012.create-transfer.md       # CreateTransfer command
├── CON-CASH-013.import-statement.md      # ImportStatement command
├── CON-CASH-014.reconcile-account.md     # ReconcileAccount command
├── CON-CASH-015.reconciliation-tolerance-policy.md # Policy
└── CON-CASH-016.bank-fee-policy.md      # Policy
```

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md)
- [Engineering Constitution](../../../../knowledge/constitution/ENGINEERING.md)
- [Ontology Standards](../../../../knowledge/ontology/STANDARDS.md)
