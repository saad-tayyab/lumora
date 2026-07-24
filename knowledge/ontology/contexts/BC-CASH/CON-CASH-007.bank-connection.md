---
id: CON-CASH-007
name: BankConnection
context: BC-CASH
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - cash
  - treasury
  - bank
  - connection
  - integration
---

# BankConnection

## Definition
An entity representing a configured connection to a financial institution's API or data feed. Manages the integration credentials, sync status, and configuration for automated bank data retrieval.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| bank_account_id | UUID v7 | yes | Reference to connected BankAccount |
| connection_type | enum | yes | Plaid, Yodlee, OFX, Manual |
| institution_name | string(100) | yes | Name of financial institution |
| institution_id | string(50) | no | Institution identifier in external system |
| access_token | string(255) | yes | Encrypted access token for API |
| refresh_token | string(255) | no | Encrypted refresh token |
| status | enum | yes | Active, Expired, Error, Disabled |
| last_sync_at | timestamp | no | Last successful sync timestamp |
| last_sync_error | string(255) | no | Error message from last failed sync |
| sync_frequency | enum | yes | Realtime, Hourly, Daily, Manual |
| created_by | UUID v7 | yes | User who created the connection |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |
| deleted_at | timestamp | no | Soft deletion timestamp |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-001 (BankAccount) | belongs-to | N:1 | Connection for this account |
| CON-CASH-003 (BankStatement) | has-many | 1:N | Statements imported via this connection |

## Invariants
- INV-CASH-020: Access tokens must be encrypted at rest.
- INV-CASH-021: Connection status must reflect actual API connectivity.
- INV-CASH-022: Soft deletion is mandatory (deleted_at field).

## Business Rules
- No business rules directly defined for this entity.

## Events
- CON-CASH-010 (StatementImported) — emitted when a statement is imported via this connection

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#42-inventory-invariants)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
