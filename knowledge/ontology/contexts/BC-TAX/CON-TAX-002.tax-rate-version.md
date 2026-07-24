---
id: CON-TAX-002
name: Tax Rate Version
context: BC-TAX
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - tax
  - accounting
  - temporal
  - rate
---

# Tax Rate Version

## Definition

An immutable value object representing a temporal version of a tax rate. Tax rates are not mutated; instead, a new version is created when a rate changes. Each version carries an effective date and optional expiry date, enabling precise historical lookups. Only the active (non-expired) version is applied to new transactions.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Globally unique identifier |
| tenantId | UUID | yes | Tenant isolation key |
| taxCodeId | UUID | yes | Reference to the parent tax code |
| rate | decimal(5,4) | yes | Tax rate as a decimal (e.g., 0.1500 for 15%) |
| effectiveDate | date | yes | Date from which this rate applies |
| expiryDate | date | no | Date after which this rate no longer applies |
| status | enum | yes | active, superseded, expired |
| createdAt | timestamp | yes | Record creation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-TAX-001 (Tax Code) | belongs-to | N:1 | Rate version belongs to a tax code |
| CON-TAX-004 (Tax Transaction) | uses | N:1 | Transactions snapshot this specific rate version |

## Invariants

- INV-TAX-001: Every tax rate version must have an effective date. The expiry date is optional.
- Only one rate version per tax code may be active at any given time.
- A new rate version supersedes the previously active version.

## Business Rules

- BR-014: Tax rates are versioned with effective dates.
- BR-017: Expired tax rates cannot be applied to new transactions.

## Events

- TaxRateCreated
- TaxRateSuperseded

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-014, BR-017
- Invariants: INV-TAX-001
