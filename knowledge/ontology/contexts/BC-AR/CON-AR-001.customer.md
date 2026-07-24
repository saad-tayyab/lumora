---
id: CON-AR-001
name: Customer
context: BC-AR
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - customer
  - core
---

# Customer

## Definition

A business entity or individual that purchases goods or services on credit. Customers are the primary external party in the Accounts Receivable context and hold credit terms, payment history, and outstanding balances.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(200) | yes | Customer display name |
| email | string(255) | no | Primary contact email |
| phone | string(50) | no | Primary contact phone |
| address_line1 | string(200) | no | Street address line 1 |
| address_line2 | string(200) | no | Street address line 2 |
| city | string(100) | no | City |
| state | string(100) | no | State or province |
| postal_code | string(20) | no | Postal or ZIP code |
| country | string(3) | no | ISO 3166-1 alpha-3 country code |
| payment_terms | string(50) | yes | Payment terms (e.g., "Net 30", "Net 60") |
| credit_limit | numeric(19,4) | no | Maximum outstanding balance allowed |
| is_active | boolean | yes | Whether the customer is active |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Record last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-002 (Invoice) | has-many | 1:N | Customer has many invoices |
| CON-AR-004 (Payment) | has-many | 1:N | Customer has many payments |
| CON-AR-006 (CreditNote) | has-many | 1:N | Customer has many credit notes |
| CON-AR-008 (CreditLimit) | has-one | 1:1 | Customer has one credit limit |

## Invariants

- INV-CROSS-003: Customer has a globally unique identifier (UUID v7).
- INV-AUTH-003: Customer supports soft deletion.

## Business Rules

- BR-003: Payment terms are defined per customer.

## Events

- CustomerCreated
- CustomerUpdated
- CustomerDeactivated

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
