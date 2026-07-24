---
id: CTR-AUTH-004
concept: CON-AUTH-002
attribute: name
type: unique
scope: tenant_id
description: "Role names must be unique within a tenant"
severity: error
version: 1.0.0
---

# Unique Role Name per Tenant

## Definition

Each role name must be unique within a tenant. Two roles in the same tenant cannot share a name.

## Concept

- **CON-AUTH-002** (Role) — Entity

## Attribute

- **name** — The role's display name

## Scope

- **tenant_id** — Uniqueness is scoped to the tenant

## Business Rule

- System roles have reserved names that cannot be used by custom roles.
- Role names are case-sensitive.
