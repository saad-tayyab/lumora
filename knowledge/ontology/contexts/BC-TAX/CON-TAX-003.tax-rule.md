---
id: CON-TAX-003
name: Tax Rule
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
  - rules
  - auto-assignment
---

# Tax Rule

## Definition

An entity that defines automatic tax code assignment rules. Tax rules determine which tax code is applied to a transaction based on configurable criteria such as entity type, supplier country, item category, and delivery location. Rules are evaluated in priority order, and the first matching rule wins.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Globally unique identifier |
| tenantId | UUID | yes | Tenant isolation key |
| taxCodeId | UUID | yes | Tax code to assign when this rule matches |
| ruleName | varchar(100) | yes | Human-readable rule name |
| applyOn | enum | yes | purchase, sale, both |
| purchasingEntityMethod | enum | no | Method for determining tax based on purchasing entity type |
| itemSegmentMethod | enum | no | Method for determining tax based on item category/segment |
| supplierCountryMethod | enum | no | Method for determining tax based on supplier country |
| deliveryLocationMethod | enum | no | Method for determining tax based on delivery location |
| priority | int | yes | Evaluation order (lower number = higher priority) |
| isActive | boolean | yes | Whether this rule is active |
| createdAt | timestamp | yes | Record creation timestamp |
| updatedAt | timestamp | yes | Last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-TAX-001 (Tax Code) | belongs-to | N:1 | Rule assigns a specific tax code |

## Invariants

- Priority values must be unique within a tenant for active rules.
- At least one method field must be non-null for a valid rule.

## Business Rules

- BR-016: Tax auto-assignment rules are evaluated by priority order.

## Events

- TaxRuleCreated
- TaxRuleUpdated
- TaxRuleDeactivated

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-016
