---
id: CON-REPORT-013
name: ShareDashboard
context: BC-REPORT
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - reporting
  - commands
  - collaboration
---

# ShareDashboard

## Definition

A command that shares a dashboard with other users or groups, granting them access at a specified permission level.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| dashboard_id | UUID v7 | yes | ID of the dashboard to share |
| tenant_id | UUID v7 | yes | Tenant context |
| shared_by | UUID v7 | yes | User performing the share |
| shared_with_user_ids | array | no | User IDs to share with |
| shared_with_group_ids | array | no | Group IDs to share with |
| permission_level | enum | yes | view, edit, admin |
| expires_at | timestamp | no | Expiration time for the share |
| requested_at | timestamp | yes | When the command was issued |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-002 (Dashboard) | targets | 1:1 | Command targets a specific dashboard |

## Invariants

- At least one recipient (user or group) must be specified
- User must have admin or owner access to the dashboard
- Permission level must be one of the predefined enum values

## Business Rules

- Sharing triggers DashboardShared event
- Recipients receive notification of the shared dashboard
- Duplicate shares update the permission level

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
