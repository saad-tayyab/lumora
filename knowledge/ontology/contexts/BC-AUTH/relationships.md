---
title: BC-AUTH Relationships
context: BC-AUTH
version: 1.0.0
status: active
---

# BC-AUTH Relationships

## Relationship Registry

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-001 | CON-AUTH-001 (User) | CON-AUTH-002 (Role) | has-many | M:N | A user can have multiple roles |
| REL-002 | CON-AUTH-001 (User) | CON-AUTH-004 (Session) | has-many | 1:N | A user can have multiple active sessions |
| REL-003 | CON-AUTH-001 (User) | CON-AUTH-005 (OAuthProvider) | has-many | 1:N | A user can link multiple OAuth providers |
| REL-004 | CON-AUTH-001 (User) | CON-AUTH-006 (UserCredential) | has-one | 1:1 | A user has exactly one credential record |
| REL-005 | CON-AUTH-001 (User) | CON-AUTH-007 (MFAConfig) | has-one | 1:1 | A user has at most one MFA configuration |
| REL-006 | CON-AUTH-001 (User) | CON-AUTH-008 (AuditLog) | has-many | 1:N | Every user action produces an audit log entry |
| REL-007 | CON-AUTH-002 (Role) | CON-AUTH-003 (Permission) | has-many | M:N | A role contains multiple permissions |
| REL-008 | CON-AUTH-004 (Session) | CON-AUTH-001 (User) | belongs-to | N:1 | A session belongs to one user |
| REL-009 | CON-AUTH-005 (OAuthProvider) | CON-AUTH-001 (User) | belongs-to | N:1 | An OAuth provider link belongs to one user |
| REL-010 | CON-AUTH-006 (UserCredential) | CON-AUTH-001 (User) | belongs-to | 1:1 | A credential belongs to one user |
| REL-011 | CON-AUTH-007 (MFAConfig) | CON-AUTH-001 (User) | belongs-to | 1:1 | An MFA config belongs to one user |
| REL-012 | CON-AUTH-008 (AuditLog) | CON-AUTH-001 (User) | belongs-to | N:1 | An audit log entry belongs to one user |
| REL-013 | CON-AUTH-013 (CreateUser) | CON-AUTH-001 (User) | creates | 1:1 | CreateUser command creates a User aggregate |
| REL-014 | CON-AUTH-014 (AuthenticateUser) | CON-AUTH-001 (User) | authenticates | 1:1 | AuthenticateUser command authenticates a user |
| REL-015 | CON-AUTH-015 (AssignRole) | CON-AUTH-002 (Role) | references | 1:1 | AssignRole command assigns a Role to a User |

## Relationship Files

- [REL-001](../../relationships/REL-001.user-has-many-roles.md)
- [REL-002](../../relationships/REL-002.user-has-many-sessions.md)
- [REL-003](../../relationships/REL-003.user-has-many-oauth-providers.md)
- [REL-004](../../relationships/REL-004.user-has-one-credential.md)
- [REL-005](../../relationships/REL-005.user-has-one-mfa-config.md)
- [REL-006](../../relationships/REL-006.user-has-many-audit-logs.md)
- [REL-007](../../relationships/REL-007.role-has-many-permissions.md)
- [REL-008](../../relationships/REL-008.session-belongs-to-user.md)
- [REL-009](../../relationships/REL-009.oauth-provider-belongs-to-user.md)
- [REL-010](../../relationships/REL-010.credential-belongs-to-user.md)
- [REL-011](../../relationships/REL-011.mfa-config-belongs-to-user.md)
- [REL-012](../../relationships/REL-012.audit-log-belongs-to-user.md)
- [REL-013](../../relationships/REL-013.create-user-creates-user.md)
- [REL-014](../../relationships/REL-014.authenticate-user-authenticates-user.md)
- [REL-015](../../relationships/REL-015.assign-role-references-role.md)
