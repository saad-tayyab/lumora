---
id: CON-CASH-006
name: Currency
context: BC-CASH
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - cash
  - treasury
  - currency
  - value-object
---

# Currency

## Definition
A value object representing a monetary currency using ISO 4217 standards. Immutable and identified by its attributes rather than a unique ID. Ensures consistent currency handling across all cash and treasury operations.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string(3) | yes | ISO 4217 currency code (e.g., USD, EUR, GBP) |
| name | string(50) | yes | Full currency name (e.g., United States Dollar) |
| symbol | string(5) | yes | Currency symbol (e.g., $, €, £) |
| decimal_places | integer | yes | Number of decimal places (typically 2) |
| is_active | boolean | yes | Whether currency is currently usable |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-001 (BankAccount) | used-by | N:1 | Accounts denominated in this currency |
| CON-CASH-002 (BankTransfer) | used-by | N:1 | Transfers in this currency |

## Invariants
- INV-CASH-017: Currency code must be a valid ISO 4217 code.
- INV-CASH-018: Decimal places must be non-negative (typically 0, 2, or 3).
- INV-CASH-019: Currency is immutable once created (value object).

## Business Rules
- BR-001: All monetary values use minor units for storage — currency defines the decimal precision.

## Events
- None (value objects do not emit events)

## References
- [ISO 4217 Currency Codes](https://en.wikipedia.org/wiki/ISO_4217)
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#41-financial-invariants)
