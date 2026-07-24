---
id: CON-AUTH-001
name: User
context: BC-AUTH
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - identity
  - core
---

# User

## Definition

The aggregate root representing a unique person or system process within the Lumora ERP system. The User is the primary identity entity to which all actions, roles, and permissions are attributed.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| email | string(255) | yes | Primary email address (used for login) |
| name | string(100) | yes | Display name |
| username | string(50) | yes | Unique username |
| status | enum | yes | active, inactive, suspended, deleted |
| email_verified | boolean | yes | Whether email has been verified |
| mfa_enabled | boolean | yes | Whether MFA is enabled |
| tenant_id | UUID v7 | yes | Tenant this user belongs to |
| created_at | timestamp | yes | Account creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |
| deleted_at | timestamp | no | Soft deletion timestamp (INV-AUTH-003) |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-002 (Role) | has-many | M:N | User can have multiple roles |
| CON-AUTH-004 (Session) | has-many | 1:N | User can have multiple active sessions |
| CON-AUTH-005 (OAuthProvider) | has-many | 1:N | User can link multiple OAuth providers |
| CON-AUTH-006 (UserCredential) | has-many | 1:N | User has authentication credentials |
| CON-AUTH-007 (MFAConfig) | has-one | 1:1 | User has one MFA configuration |
| CON-AUTH-008 (AuditLog) | has-many | 1:N | All user actions are audited |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.
- INV-AUTH-002: Roles are additive only; no role can revoke base permissions.
- INV-AUTH-003: Soft deletion is mandatory — deleted_at must be set rather than removing the record.

## Business Rules

- BR-001: All monetary values use minor units for storage. (Cross-context reference)
- Email addresses must be unique within a tenant.
- Usernames must be unique within a tenant.

## Events

- CON-AUTH-009 (UserCreated)
- CON-AUTH-010 (UserAuthenticated)
- CON-AUTH-011 (RoleAssigned)

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Constitution — Authentication Invariants](../../constitution/DOMAIN.md#43-authentication-invariants)
