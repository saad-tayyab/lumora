---
id: CON-HR-002
name: Department
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

# Department

## Definition

An organizational unit within the company that groups employees by function or business area. Departments have a head (typically a manager-level employee) and may have a parent department for hierarchical organizational structures.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(100) | yes | Department name |
| code | string(20) | yes | Short department code |
| description | string(500) | no | Department description |
| head_id | UUID | no | Reference to Employee (department head) |
| parent_id | UUID | no | Reference to parent Department |
| status | enum | yes | Active, Inactive |
| created_at | timestamp | yes | Record creation time |
| updated_at | timestamp | yes | Last modification time |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-001 (Employee) | has-many | 1:N | Department contains many employees |
| CON-HR-001 (Employee) | has-one | 1:1 | Department has one head |
| CON-HR-002 (Department) | belongs-to | N:1 | Department may have a parent department |

## Invariants

- INV-HR-004: Department codes must be unique across the organization.
- INV-HR-005: A department cannot be its own parent (no circular hierarchy).

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
