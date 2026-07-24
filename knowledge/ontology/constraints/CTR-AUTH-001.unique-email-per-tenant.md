---
id: CTR-AUTH-001
concept: CON-AUTH-001
attribute: email
type: unique
scope: tenant_id
description: "Email addresses must be unique within a tenant"
severity: error
version: 1.0.0
---

# Unique Email per Tenant

## Definition

Each email address must be unique within a tenant. Two users in the same tenant cannot share an email address.

## Concept

- **CON-AUTH-001** (User) — Aggregate root

## Attribute

- **email** — The user's primary email address

## Scope

- **tenant_id** — Uniqueness is scoped to the tenant

## Business Rule

- Email is used as the primary login identifier.
- Email verification is required before account activation.
