---
id: CON-TAX-005
name: Tax Liability
context: BC-TAX
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - tax
  - accounting
  - liability
  - period
---

# Tax Liability

## Definition

An entity that tracks outstanding tax amounts per tax code per accounting period. It aggregates collected tax (from sales) and paid tax (from purchases/input tax) to determine the net liability or refund position for a given period. Balances are updated as tax transactions are posted.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Globally unique identifier |
| tenantId | UUID | yes | Tenant isolation key |
| taxCodeId | UUID | yes | Tax code this liability tracks |
| periodId | UUID | yes | Accounting period reference |
| totalCollected | decimal(19,4) | yes | Total tax collected (output tax) in the period |
| totalPaid | decimal(19,4) | yes | Total tax paid (input tax) in the period |
| balance | decimal(19,4) | yes | Net liability (totalCollected minus totalPaid) |
| createdAt | timestamp | yes | Record creation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-TAX-001 (Tax Code) | belongs-to | N:1 | Liability tracks a specific tax code |
| CON-TAX-004 (Tax Transaction) | aggregates | 1:N | Liability aggregates transactions for the period |

## Invariants

- Balance must equal totalCollected minus totalPaid.
- Only one liability record may exist per tax code per period per tenant.

## Business Rules

- BR-015: Tax amount is calculated and snapshotted at transaction time.

## Events

- TaxLiabilityUpdated
- TaxLiabilityClosed

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-015
