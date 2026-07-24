---
id: CON-ASSET-008
name: Capex Allocation
context: BC-ASSET
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - fixed-asset
  - capex
  - capital-expenditure
  - allocation
---

# Capex Allocation

## Definition

The distribution of capital expenditure costs across one or more fixed assets. Used when a single purchase covers multiple assets or when costs are shared across departments/projects.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| assetId | UUID | Reference to Fixed Asset |
| glAccountId | UUID | GL account for the capex |
| allocatedAmount | decimal(19,4) | Amount allocated to this asset |
| description | text | Description of allocation |
| createdBy | UUID | Who created the allocation |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last modification |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-ASSET-001 Fixed Asset Register | belongs-to | Allocation belongs to one asset |
| CON-FIN-001 Account | uses | Allocation references a GL account |

## Business Rules

- BR-194: Capitalize only necessary costs
- BR-208: Asset improvements increase the asset account

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-194, BR-208
