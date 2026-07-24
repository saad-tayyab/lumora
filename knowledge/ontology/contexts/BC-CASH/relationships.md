---
id: REL-CASH-001
source: CON-CASH-001
target: CON-CASH-006
type: uses
cardinality: "1:1"
required: true
description: "A bank account is denominated in a single currency"
version: 1.0.0
---

## BankAccount uses Currency

A bank account operates in a single currency. The currency determines decimal precision and formatting for all monetary values in the account.

---

## Relationships in BC-CASH

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-CASH-001 | CON-CASH-001 (BankAccount) | CON-CASH-006 (Currency) | uses | 1:1 | Account denominated in a single currency |
| REL-CASH-002 | CON-CASH-001 (BankAccount) | CON-CASH-007 (BankConnection) | has-one | 1:1 | Optional connection to bank API |
| REL-CASH-003 | CON-CASH-001 (BankAccount) | CON-CASH-002 (BankTransfer) | has-many | 1:N | Transfers from this account |
| REL-CASH-004 | CON-CASH-001 (BankAccount) | CON-CASH-003 (BankStatement) | has-many | 1:N | Statements for this account |
| REL-CASH-005 | CON-CASH-001 (BankAccount) | CON-CASH-004 (ReconciliationEntry) | has-many | 1:N | Reconciliation entries |
| REL-CASH-006 | CON-CASH-002 (BankTransfer) | CON-CASH-006 (Currency) | uses | 1:1 | Currency of the transfer |
| REL-CASH-007 | CON-CASH-002 (BankTransfer) | CON-CASH-008 (TransferCreated) | triggers | 1:1 | Event emitted on creation |
| REL-CASH-008 | CON-CASH-002 (BankTransfer) | CON-CASH-009 (TransferCompleted) | triggers | 0:1 | Event emitted on completion |
| REL-CASH-009 | CON-CASH-003 (BankStatement) | CON-CASH-004 (ReconciliationEntry) | has-many | 1:N | Entries to reconcile |
| REL-CASH-010 | CON-CASH-003 (BankStatement) | CON-CASH-010 (StatementImported) | triggers | 1:1 | Event emitted on import |
| REL-CASH-011 | CON-CASH-004 (ReconciliationEntry) | CON-CASH-005 (ReconciliationMatch) | has-many | 1:N | Matches for this entry |
| REL-CASH-012 | CON-CASH-004 (ReconciliationEntry) | CON-CASH-014 (ReconciliationCompleted) | triggers | 1:1 | Event emitted when all matched |
| REL-CASH-013 | CON-CASH-005 (ReconciliationMatch) | CON-CASH-004 (ReconciliationEntry) | belongs-to | N:1 | Match for this entry |
| REL-CASH-014 | CON-CASH-007 (BankConnection) | CON-CASH-001 (BankAccount) | belongs-to | N:1 | Connection for this account |
| REL-CASH-015 | CON-CASH-007 (BankConnection) | CON-CASH-003 (BankStatement) | has-many | 1:N | Statements imported via this connection |
| REL-CASH-016 | CON-CASH-012 (CreateTransfer) | CON-CASH-002 (BankTransfer) | creates | 1:1 | Command creates this transfer |
| REL-CASH-017 | CON-CASH-012 (CreateTransfer) | CON-CASH-008 (TransferCreated) | triggers | 1:1 | Event emitted on success |
| REL-CASH-018 | CON-CASH-013 (ImportStatement) | CON-CASH-003 (BankStatement) | creates | 1:1 | Command creates this statement |
| REL-CASH-019 | CON-CASH-013 (ImportStatement) | CON-CASH-010 (StatementImported) | triggers | 1:1 | Event emitted on success |
| REL-CASH-020 | CON-CASH-014 (ReconcileAccount) | CON-CASH-003 (BankStatement) | targets | 1:1 | Command targets this statement |
| REL-CASH-021 | CON-CASH-014 (ReconcileAccount) | CON-CASH-004 (ReconciliationEntry) | processes | 1:N | Entries to reconcile |
| REL-CASH-022 | CON-CASH-014 (ReconcileAccount) | CON-CASH-011 (ReconciliationCompleted) | triggers | 1:1 | Event emitted on completion |
| REL-CASH-023 | CON-CASH-015 (ReconciliationTolerancePolicy) | CON-CASH-005 (ReconciliationMatch) | enforces | 1:N | Tolerance applied to matches |
| REL-CASH-024 | CON-CASH-015 (ReconciliationTolerancePolicy) | CON-CASH-014 (ReconcileAccount) | guides | 1:N | Reconciliation uses this policy |
| REL-CASH-025 | CON-CASH-016 (BankFeePolicy) | CON-CASH-004 (ReconciliationEntry) | processes | 1:N | Fee entries processed under this policy |
