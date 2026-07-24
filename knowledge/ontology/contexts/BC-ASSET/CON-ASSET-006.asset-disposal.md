---
id: CON-ASSET-006
name: Asset Disposal
context: BC-ASSET
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - fixed-asset
  - disposal
  - retirement
  - gain-loss
---

# Asset Disposal

## Definition

The event that records removal of a fixed asset from the register. Requires depreciation to be updated to the disposal date first, then calculates gain or loss on disposal.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| assetId | UUID | Reference to Fixed Asset being disposed |
| disposalDate | date | Date of disposal |
| disposalProceeds | decimal(19,4) | Cash or consideration received |
| netBookValue | decimal(19,4) | Book value at disposal date |
| gainLoss | decimal(19,4) | Proceeds minus net book value |
| journalEntryId | UUID | Posted disposal journal entry |
| reason | text | Why asset is being disposed |
| disposedBy | UUID | Who authorized the disposal |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-ASSET-001 Fixed Asset Register | triggers | Disposal removes asset from register |
| CON-ASSET-004 Depreciation Entry | triggers | Disposal requires depreciation update first |
| CON-FIN-011 Journal Entry | triggers | Disposal posts journal entry for gain/loss |

## Invariants

- INV-ASSET-004: Disposed assets must have depreciation updated to disposal date before removal

## Business Rules

- BR-216: Update depreciation before disposal
- BR-215: Losses on disposal reported in other revenue and expense
- BR-209: Fully depreciated assets remain in ledger (status change, not deletion)

## Events

- EVT-008: AssetDisposed

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-216, BR-215, BR-209
