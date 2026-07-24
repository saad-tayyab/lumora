---
id: CON-SALES-001
name: Customer
context: BC-SALES
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - customer
  - core
---

# Customer

## Definition

A person or organization that purchases goods or services from the business. Customers are the primary external actors in the Sales & Orders bounded context and are referenced by sales orders, quotations, and accounts receivable.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(200) | yes | Customer display name |
| email | string(255) | no | Primary contact email |
| phone | string(50) | no | Primary contact phone |
| address | JSON | no | Billing/shipping address details |
| credit_limit | money | no | Maximum allowable outstanding balance |
| payment_terms | string(50) | no | Default payment terms (e.g., "Net 30") |
| tax_id | string(100) | no | Tax identification number |
| status | enum | yes | Active, Inactive, Suspended |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-003 (SalesOrder) | has-many | 1:N | Customer places many sales orders |
| CON-SALES-005 (Quotation) | has-many | 1:N | Customer receives many quotations |

## Invariants

- INV-CROSS-003: Customer ID is a globally unique UUID v7.
- INV-AUTH-003: Soft deletion is mandatory; customer records are never hard-deleted.

## Business Rules

- BR-003: Payment terms are defined per customer (from BC-AR).
- BR-007: Quotations expire after configurable days (applies to quotations linked to this customer).

## Events

- CustomerCreated
- CustomerUpdated
- CustomerSuspended

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
- [Glossary — Customer](../../../../knowledge/glossary/)
