---
id: CTR-AUTH-002
concept: CON-AUTH-001
attribute: username
type: unique
scope: tenant_id
description: "Usernames must be unique within a tenant"
severity: error
version: 1.0.0
---

# Unique Username per Tenant

## Definition

Each username must be unique within a tenant. Two users in the same tenant cannot share a username.

## Concept

- **CON-AUTH-001** (User) — Aggregate root

## Attribute

- **username** — The user's unique username

## Scope

- **tenant_id** — Uniqueness is scoped to the tenant

## Business Rule

- Usernames are used as an alternative login identifier.
- Usernames cannot be changed after creation.
