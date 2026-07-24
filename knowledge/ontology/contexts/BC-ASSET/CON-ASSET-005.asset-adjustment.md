---
id: CON-ASSET-005
name: Asset Adjustment
context: BC-ASSET
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - fixed-asset
  - adjustment
  - revaluation
  - impairment
---

# Asset Adjustment

## Definition

A modification to a fixed asset's value or useful life. Includes revaluations (increase/decrease to fair value), impairment losses, restoration of previously impaired assets, and transfers between locations or categories.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| assetId | UUID | Reference to Fixed Asset |
| adjustmentType | enum | revaluation, impairment, restoration, transfer, reclassification |
| adjustmentDate | date | Date of adjustment |
| adjustmentAmount | decimal(19,4) | Amount of adjustment |
| direction | enum | increase, decrease |
| journalEntryId | UUID | Posted journal entry (nullable) |
| description | text | Reason for adjustment |
| revisedUsefulLifeMonths | int | Updated useful life (nullable) |
| revisedSalvageValue | decimal(19,4) | Updated salvage value (nullable) |
| status | enum | draft, posted, voided |
| createdBy | UUID | Who made the adjustment |
| createdAt | timestamp | When adjustment was created |
| updatedAt | timestamp | Last modification time |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-ASSET-001 Fixed Asset Register | belongs-to | Adjustment modifies one asset |
| CON-FIN-011 Journal Entry | uses | Adjustment posts to journal |

## Invariants

- INV-ASSET-003: Revaluation cannot cause accumulated depreciation to exceed depreciable cost

## Business Rules

- BR-205: Revision of depreciation estimates is prospective (no restatement)
- BR-208: Asset improvements increase the asset account
- BR-313: Asset revaluation follows specific accounting standards

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-205, BR-208
