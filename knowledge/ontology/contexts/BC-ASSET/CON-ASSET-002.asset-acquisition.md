---
id: CON-ASSET-002
name: Asset Acquisition
context: BC-ASSET
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - fixed-asset
  - acquisition
  - lifecycle
---

# Asset Acquisition

## Definition

The event that records a new fixed asset entering the system. Triggers creation of the asset record and initialization of the depreciation schedule.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| assetId | UUID | Reference to the created Fixed Asset |
| acquisitionDate | date | Date the asset was acquired |
| acquisitionCost | decimal(19,4) | Purchase price plus capitalized costs |
| vendorId | UUID | Source vendor (cross-context reference) |
| purchaseOrderId | UUID | Linked PO (cross-context reference) |
| invoiceId | UUID | Linked AP invoice (cross-context reference) |
| depreciationMethod | enum | Selected depreciation method |
| usefulLifeMonths | int | Estimated useful life |
| salvageValue | decimal(19,4) | Estimated residual value |
| glAccountId | UUID | Target GL account |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-ASSET-001 Fixed Asset Register | triggers | Acquisition creates a new asset |
| CON-ASSET-003 Depreciation Schedule | triggers | Acquisition initializes depreciation schedule |
| CON-FIN-011 Journal Entry | triggers | Acquisition posts a journal entry |

## Invariants

- INV-ASSET-001: Acquisition must include depreciation method, useful life, and salvage value

## Business Rules

- BR-013: Depreciation method cannot change after asset is placed in service

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
