---
id: CON-PROC-001
name: Vendor
context: BC-PROC
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - vendor
  - core
---

# Vendor

## Definition

A supplier or business entity that provides goods or services to the organization. Vendors are the external parties from whom the organization procures items.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| code | string(20) | yes | Vendor code (unique within tenant) |
| name | string(200) | yes | Vendor display name |
| legal_name | string(200) | no | Legal entity name |
| tax_id | string(50) | yes | Tax identification number |
| email | string(255) | yes | Primary contact email |
| phone | string(30) | no | Primary contact phone |
| address_line1 | string(200) | yes | Street address line 1 |
| address_line2 | string(200) | no | Street address line 2 |
| city | string(100) | yes | City |
| state | string(100) | yes | State or province |
| postal_code | string(20) | yes | Postal or ZIP code |
| country | string(3) | yes | ISO 3166-1 alpha-3 country code |
| payment_terms | string(50) | yes | Default payment terms (e.g., "NET30") |
| currency | string(3) | yes | ISO 4217 currency code |
| status | enum | yes | active, inactive, suspended |
| notes | text | no | General notes about the vendor |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-002 (PurchaseOrder) | has-many | 1:N | Vendor receives purchase orders |
| CON-PROC-005 (VendorCatalogItem) | has-many | 1:N | Vendor publishes catalog items |

## Invariants

- INV-PROC-001: Vendor codes must be unique within a tenant.
- INV-PROC-002: A vendor with active purchase orders cannot be deactivated.
- INV-CROSS-003: Vendor ID is a globally unique UUID v7.

## Business Rules

- BR-004 (from DOMAIN.md): Three-way matching required for PO-based bills referencing this vendor.
- Vendors must be qualified before they can receive purchase orders.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
