---
id: CON-REPORT-014
name: DataRefreshPolicy
context: BC-REPORT
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - reporting
  - policies
  - data-management
---

# DataRefreshPolicy

## Definition

A business policy that governs how and when data sources are refreshed. Ensures data freshness while respecting system performance and resource constraints.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| policy_id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant owning this policy |
| name | string(200) | yes | Policy display name |
| description | text | no | Policy description |
| refresh_type | enum | yes | realtime, periodic, on_demand, event_driven |
| interval_seconds | integer | no | Refresh interval (required for periodic) |
| max_concurrent_refreshes | integer | yes | Maximum concurrent refresh operations |
| retry_count | integer | yes | Number of retries on failure |
| retry_delay_seconds | integer | yes | Delay between retries |
| is_active | boolean | yes | Whether the policy is active |
| created_at | timestamp | yes | Creation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-005 (DataSource) | enforces | 1:N | Policy applies to data sources |

## Invariants

- Interval seconds must be positive for periodic refresh type
- Max concurrent refreshes must be at least 1
- Retry count must be between 0 and 10

## Business Rules

- Periodic refresh types require a valid interval
- Realtime refreshes are triggered by domain events from source contexts
- On-demand refreshes are triggered by user action or API call
- Event-driven refreshes listen to specific domain events

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
