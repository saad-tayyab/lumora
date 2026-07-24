---
id: CON-TAX-001
name: Tax Code
context: BC-TAX
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - tax
  - accounting
  - configuration
  - core
---

# Tax Code

## Definition

The root aggregate for tax configuration within a tenant. A tax code defines a category of tax (e.g., sales tax, VAT, GST) and governs how tax is calculated, posted, and tracked. Each tax code links to a GL account and carries posting rules that determine how tax amounts appear on financial documents.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Globally unique identifier |
| tenantId | UUID | yes | Tenant isolation key |
| code | varchar(20) | yes | Unique tax code identifier (e.g., "VAT-15") |
| name | varchar(100) | yes | Human-readable display name |
| type | enum | yes | sales_tax, vat, gst, withholding, excise, customs, other |
| description | text | no | Detailed description of the tax code |
| glAccountId | UUID | yes | GL account for tax liability/asset posting |
| isClaimable | boolean | yes | Whether tax under this code is claimable as input tax |
| postingRule | enum | yes | add_to_total, included_in_price, separate_line |
| isActive | boolean | yes | Whether this tax code is available for use |
| createdAt | timestamp | yes | Record creation timestamp |
| updatedAt | timestamp | yes | Last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-TAX-002 (Tax Rate Version) | has-many | 1:N | A tax code has multiple rate versions over time |
| CON-TAX-003 (Tax Rule) | has-many | 1:N | A tax code is referenced by auto-assignment rules |
| CON-TAX-004 (Tax Transaction) | has-many | 1:N | A tax code is used in tax transaction records |
| CON-TAX-005 (Tax Liability) | has-many | 1:N | A tax code tracks liability per period |
| CON-FIN-001 (Chart of Accounts) | uses | N:1 | Tax code links to a GL account |

## Invariants

- INV-TAX-003: Every tax code must link to a valid GL account for liability/asset posting.
- Tax code values must be unique within a tenant.

## Business Rules

- BR-014: Tax rates are versioned with effective dates.
- BR-017: Expired tax rates cannot be applied to new transactions.

## Events

- TaxCodeCreated
- TaxCodeUpdated
- TaxCodeDeactivated

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-014, BR-017
- Invariants: INV-TAX-003
