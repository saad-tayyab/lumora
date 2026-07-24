---
id: CON-TAX-004
name: Tax Transaction
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
  - transaction
  - snapshot
---

# Tax Transaction

## Definition

An entity that records the calculated tax for a single line item on a financial document. Each tax transaction snapshots the applicable rate at the time of calculation, ensuring historical accuracy even if the rate changes later. Tax transactions feed into tax liability tracking and financial reporting.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Globally unique identifier |
| tenantId | UUID | yes | Tenant isolation key |
| entityId | UUID | yes | Reference to the source document (invoice, bill, journal entry line) |
| entityType | enum | yes | invoice, bill, journal_entry_line |
| taxCodeId | UUID | yes | Tax code applied to this line |
| taxRateId | UUID | yes | Specific rate version used (snapshot) |
| rate | decimal(5,4) | yes | Tax rate at time of calculation (denormalized for queryability) |
| baseAmount | decimal(19,4) | yes | Amount subject to tax |
| taxAmount | decimal(19,4) | yes | Calculated tax amount |
| createdAt | timestamp | yes | Record creation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-TAX-001 (Tax Code) | belongs-to | N:1 | Transaction uses a tax code |
| CON-TAX-002 (Tax Rate Version) | belongs-to | N:1 | Transaction snapshots a specific rate version |
| CON-TAX-005 (Tax Liability) | contributes-to | N:1 | Transactions aggregate into period liability |

## Invariants

- INV-TAX-002: Tax transactions must snapshot the rate at time of calculation, not reference the current rate.
- taxAmount must equal baseAmount multiplied by rate (within decimal precision).

## Business Rules

- BR-015: Tax amount is calculated and snapshotted at transaction time.

## Events

- TaxTransactionCreated

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-015
- Invariants: INV-TAX-002
