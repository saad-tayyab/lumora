---
id: CON-AUTH-005
name: OAuthProvider
context: BC-AUTH
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - oauth
  - social-login
---

# OAuthProvider

## Definition

An entity representing a linked external identity provider (e.g., Google, GitHub, Microsoft) for a user. OAuthProvider enables single sign-on and social login capabilities.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| user_id | UUID v7 | yes | The user this provider is linked to |
| provider | string(50) | yes | Provider name (google, github, microsoft) |
| provider_user_id | string(255) | yes | User ID at the external provider |
| access_token | string(500) | no | Encrypted access token |
| refresh_token | string(500) | no | Encrypted refresh token |
| expires_at | timestamp | no | Token expiration timestamp |
| created_at | timestamp | yes | Link creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | belongs-to | N:1 | Provider link belongs to one user |

## Invariants

- A user can only have one link per provider type.
- Provider user IDs must be unique across the system.

## Business Rules

- OAuth tokens must be encrypted at rest.
- Refresh tokens must be used to maintain access.

## Events

- None

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
