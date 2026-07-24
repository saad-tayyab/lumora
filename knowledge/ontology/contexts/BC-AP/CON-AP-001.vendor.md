---
id: CON-AP-001
name: Vendor
context: BC-AP
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - vendor
  - core
---

# Vendor

## Definition

A supplier or service provider from whom the organization purchases goods or services. Vendors are the external parties to whom the organization owes payment.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(200) | yes | Vendor display name |
| code | string(20) | yes | Unique vendor code |
| tax_id | string(50) | no | Tax identification number |
| email | string(255) | no | Primary contact email |
| phone | string(30) | no | Primary contact phone |
| address_line_1 | string(200) | no | Street address |
| address_line_2 | string(200) | no | Address line 2 |
| city | string(100) | no | City |
| state | string(100) | no | State or province |
| postal_code | string(20) | no | Postal or ZIP code |
| country | string(3) | no | ISO 3166-1 alpha-3 country code |
| payment_terms | string(50) | no | Default payment terms (e.g., "Net 30") |
| currency | string(3) | yes | ISO 4217 currency code |
| is_active | boolean | yes | Whether vendor is active |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |
| created_by | UUID v7 | yes | User who created the record |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-003 (Bill) | has-many | 1:N | Vendor receives many bills |

## Invariants

- INV-AUTH-003: Soft deletion is mandatory.
- Vendor codes must be unique across the system.

## Business Rules

- BR-004: Three-way matching required for PO-based bills (applied to bills from this vendor).

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
