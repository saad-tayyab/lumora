---
id: CON-FIN-078
name: Accounts Payable
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

# Accounts Payable

## Definition

Money owed by the business to creditors or vendors for goods or services purchased on credit, recorded as a liability with a normal credit balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| creditor_name | string | Name of the vendor or creditor |
| amount_owed | decimal | Outstanding balance owed |
| due_date | date | Date payment is due |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-085 (Account) | extends | 1:1 | Accounts payable is a current liability account |
| CON-FIN-121 (Current Liability) | extends | 1:1 | Classified as a current liability on the balance sheet |
| CON-FIN-017 (Consolidated Balance Sheet) | feeds | N:M | Accounts payable appears as a current liability on the balance sheet |
| CON-FIN-007 (Business Transaction) | triggers | N:M | Purchase transactions trigger accounts payable creation |
| CON-FIN-024 (Bank Reconciliation) | uses | N:M | Payments on accounts payable appear in bank reconciliation |

## Invariants

- INV-FIN-001: Accounts payable balance must equal the sum of all outstanding vendor balances.
- INV-FIN-003: Every state change (invoice receipt, payment, adjustment) must have an audit trail.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).

## Business Rules

- BR-003: Three-way matching required for PO-based bills — purchase order, receiving report, and vendor invoice must match.
- BR-142: Three-way match for inventory control.
- BR-160: Voucher system documentation rule — payables require proper documentation before payment.
- BR-164: Cash payments authorization rule — payments must be authorized.

## Events

- BillReceived
- BillApproved
- PaymentProcessed
- PaymentDue
- VendorCreditReceived

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Invariants](../../constitution/DOMAIN.md#4-domain-invariants)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
