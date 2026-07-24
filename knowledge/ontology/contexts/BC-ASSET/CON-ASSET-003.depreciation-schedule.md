---
id: CON-ASSET-003
name: Depreciation Schedule
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
  - schedule
---

# Depreciation Schedule

## Definition

A plan that defines the period-by-period depreciation amounts for a fixed asset over its useful life. Created at asset acquisition and executed monthly/quarterly.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| assetId | UUID | Reference to Fixed Asset |
| startDate | date | First depreciation period |
| endDate | date | Last depreciation period |
| totalDepreciableCost | decimal(19,4) | Cost minus salvage value |
| monthlyAmount | decimal(19,4) | Depreciation amount per month (straight-line) |
| method | enum | Depreciation method used |
| status | enum | active, completed, cancelled |
| createdAt | timestamp | When schedule was created |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-ASSET-001 Fixed Asset Register | belongs-to | Schedule belongs to one asset |
| CON-ASSET-004 Depreciation Entry | has-many | Schedule produces multiple entries |

## Invariants

- INV-ASSET-002: Depreciation entries must reference an open accounting period
- INV-ASSET-003: Total depreciation cannot exceed depreciable cost

## Business Rules

- BR-009: Depreciation methods must be applied consistently
- BR-011: Depreciation must be posted before period close
- BR-204: Partial-year depreciation proration applies

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-009, BR-011, BR-204
