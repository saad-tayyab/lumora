---
id: CON-HR-003
name: Designation
context: BC-HR
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - organizational-structure
---

# Designation

## Definition

A job title or role level within the organization. Designations define the hierarchical level of an employee (e.g., Junior, Senior, Lead, Manager, Director) and may be associated with salary bands and permission levels.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(100) | yes | Designation name (e.g., "Senior Developer") |
| code | string(20) | yes | Short designation code |
| level | integer | yes | Hierarchy level (1 = junior, higher = senior) |
| description | string(500) | no | Designation description |
| salary_band_min | decimal | no | Minimum salary for this designation |
| salary_band_max | decimal | no | Maximum salary for this designation |
| status | enum | yes | Active, Inactive |
| created_at | timestamp | yes | Record creation time |
| updated_at | timestamp | yes | Last modification time |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-001 (Employee) | has-many | 1:N | Many employees can share same designation |

## Invariants

- INV-HR-006: Designation codes must be unique.
- INV-HR-007: Designation level must be a positive integer.
- INV-HR-008: Salary band min must be less than or equal to salary band max.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
