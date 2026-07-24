---
id: CON-ASSET-004
name: Depreciation Entry
context: BC-ASSET
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - fixed-asset
  - depreciation
  - journal-entry
---

# Depreciation Entry

## Definition

A single period's depreciation recording for a fixed asset. Each entry debits Depreciation Expense and credits Accumulated Depreciation, posting to the general ledger.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| assetId | UUID | Reference to Fixed Asset |
| periodId | UUID | Reference to Accounting Period |
| depreciationAmount | decimal(19,4) | Amount for this period |
| accumulatedDepreciation | decimal(19,4) | Running total after this entry |
| netBookValue | decimal(19,4) | Book value after this entry |
| journalEntryId | UUID | Posted journal entry (nullable until posted) |
| status | enum | draft, posted, voided |
| createdAt | timestamp | When entry was created |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-ASSET-003 Depreciation Schedule | belongs-to | Entry belongs to a schedule |
| CON-ASSET-001 Fixed Asset Register | belongs-to | Entry relates to one asset |
| CON-FIN-011 Journal Entry | uses | Entry posts to a journal entry |
| CON-FIN-055 Accounting Period | uses | Entry must be in an open period |

## Invariants

- INV-ASSET-002: Depreciation entries must reference an open accounting period
- INV-ASSET-003: Accumulated depreciation cannot exceed depreciable cost

## Business Rules

- BR-011: Depreciation must be posted before period close
- BR-012: Accumulated depreciation cannot exceed depreciable cost
- BR-062: Depreciation does not reduce the asset account directly

## Events

- EVT-007: DepreciationPosted

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-011, BR-012, BR-062
