---
id: CON-REPORT-010
name: DashboardShared
context: BC-REPORT
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - reporting
  - events
  - domain-event
  - collaboration
---

# DashboardShared

## Definition

A domain event emitted when a dashboard is shared with other users or groups. This event triggers access permission updates and optional notification delivery.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| dashboard_id | UUID v7 | yes | ID of the shared dashboard |
| tenant_id | UUID v7 | yes | Tenant context |
| shared_by | UUID v7 | yes | User who shared the dashboard |
| shared_with_user_ids | array | no | Specific users granted access |
| shared_with_group_ids | array | no | Groups granted access |
| permission_level | enum | yes | view, edit, admin |
| shared_at | timestamp | yes | When the dashboard was shared |
| expires_at | timestamp | no | When the share expires |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-002 (Dashboard) | triggers | 1:1 | Event is caused by dashboard sharing |

## Invariants

- At least one of shared_with_user_ids or shared_with_group_ids must be non-empty
- Permission level must be one of the predefined enum values

## Business Rules

- Share notifications are sent to newly granted users
- Expired shares are automatically revoked
- Users can only share dashboards they own or have admin access to

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
- [Event Catalog](../../../constitution/DOMAIN.md#7-event-catalog)
