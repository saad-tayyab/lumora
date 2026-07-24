---
id: CON-ASSET-001
name: Fixed Asset Register
context: BC-ASSET
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - fixed-asset
  - accounting
  - register
---

# Fixed Asset Register

## Definition

The root aggregate that manages all fixed assets within a tenant. It enforces invariants around asset lifecycle, depreciation calculations, and disposal processing.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| name | varchar(200) | Human-readable asset name |
| assetNumber | varchar(50) | Auto-generated unique number per tenant |
| description | text | Detailed description |
| categoryId | UUID | Reference to asset category |
| acquisitionDate | date | Date asset was acquired |
| acquisitionCost | decimal(19,4) | Original purchase cost |
| salvageValue | decimal(19,4) | Estimated value at end of useful life |
| usefulLifeMonths | int | Expected useful life in months |
| depreciationMethod | enum | straight_line, declining_balance, units_of_activity, sum_of_years_digits |
| status | enum | active, fully_depreciated, disposed, under_construction |
| accumulatedDepreciation | decimal(19,4) | Running total of depreciation |
| netBookValue | decimal(19,4) | Current book value (cost - accumulated depreciation) |
| glAccountId | UUID | GL account for this asset class |
| isDepreciable | boolean | Whether asset is subject to depreciation |
| disposalDate | date | Date asset was disposed (nullable) |
| disposalProceeds | decimal(19,4) | Amount received from disposal (nullable) |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-ASSET-002 Asset Acquisition | has-many | Assets are created through acquisition events |
| CON-ASSET-003 Depreciation Schedule | has-many | Each asset has a depreciation schedule |
| CON-ASSET-005 Asset Adjustment | has-many | Assets can have adjustments (revaluation, impairment) |
| CON-ASSET-007 Asset Category | belongs-to | Assets belong to exactly one category |
| CON-FIN-003 Journal Entry | uses | Depreciation posts to journal entries |
| CON-FIN-001 Account | uses | Assets link to GL accounts |

## Invariants

- INV-ASSET-001: Every fixed asset must have a depreciation method, useful life, and salvage value at acquisition
- INV-ASSET-003: Accumulated depreciation cannot exceed depreciable cost
- INV-ASSET-004: Disposed assets must have depreciation updated to disposal date

## Business Rules

- BR-009: Depreciation methods must be applied consistently throughout asset life
- BR-010: Land is not a depreciable asset
- BR-012: Accumulated depreciation cannot exceed depreciable cost
- BR-013: Depreciation method cannot change after asset is placed in service

## Events

- EVT-007: DepreciationPosted
- EVT-008: AssetDisposed

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-009, BR-010, BR-012, BR-013
