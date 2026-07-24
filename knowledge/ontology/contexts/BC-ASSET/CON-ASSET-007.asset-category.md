---
id: CON-ASSET-007
name: Asset Category
context: BC-ASSET
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - fixed-asset
  - category
  - classification
---

# Asset Category

## Definition

A classification grouping for fixed assets that determines default depreciation parameters and GL account assignments. Examples: Buildings, Machinery, Vehicles, Office Equipment, Land.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| name | varchar(100) | Category name |
| code | varchar(20) | Short code |
| description | text | Description |
| defaultDepreciationMethod | enum | Default method for assets in this category |
| defaultUsefulLifeMonths | int | Default useful life |
| defaultSalvageValuePercent | decimal(5,2) | Default salvage as % of cost |
| isDepreciable | boolean | Whether assets in this category are depreciable |
| glAccountId | UUID | Default GL account for this category |
| isActive | boolean | Whether category is in use |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last modification |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-ASSET-001 Fixed Asset Register | has-many | Category contains many assets |
| CON-FIN-001 Account | uses | Category links to a GL account |

## Business Rules

- BR-010: Land category is marked as non-depreciable
- BR-214: Depreciation methods can differ by asset class

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-010, BR-214
