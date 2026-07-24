---
id: CON-CASH-013
name: ImportStatement
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
  - statement
  - import
---

# ImportStatement

## Definition
A command representing the intent to import a bank statement into the system. Supports multiple import sources including API feeds, CSV uploads, and OFX files. The command initiates the import workflow including parsing, validation, and storage.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| bank_account_id | UUID v7 | yes | Target bank account |
| import_source | enum | yes | API, CSV, OFX, Manual |
| file_reference | string(255) | no | Reference to uploaded file |
| connection_id | UUID v7 | no | BankConnection for API imports |
| statement_date | date | yes | Date of the statement |
| period_start | date | yes | Statement period start |
| period_end | date | yes | Statement period end |
| idempotency_key | string(100) | yes | Prevents duplicate imports |
| imported_by | UUID v7 | yes | User performing the import |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-003 (BankStatement) | creates | 1:1 | Command creates this statement |
| CON-CASH-010 (StatementImported) | triggers | 1:1 | Event emitted on success |

## Invariants
- INV-CASH-030: Command must include all required fields for statement import.
- INV-CASH-031: Idempotency key must be unique per tenant.
- INV-CASH-032: Period end must be after period start.

## Business Rules
- No business rules directly defined for this command.

## Events
- CON-CASH-010 (StatementImported) — emitted when command is processed

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
