---
id: CON-REPORT-002
name: Dashboard
context: BC-REPORT
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - reporting
  - analytics
  - visualization
---

# Dashboard

## Definition

A visual display of key metrics and data visualizations organized on a single screen. Dashboards aggregate information from multiple reports and KPIs to provide a real-time or near-real-time view of business performance.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant owning this dashboard |
| title | string(200) | yes | Dashboard display title |
| description | text | no | Dashboard description |
| layout | json | yes | Widget layout configuration |
| is_shared | boolean | yes | Whether dashboard is shared with others |
| refresh_interval_seconds | integer | no | Auto-refresh interval in seconds |
| created_by | UUID v7 | yes | User who created the dashboard |
| created_at | timestamp | yes | Creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-003 (KPI) | has-many | 1:N | Dashboard displays multiple KPIs |
| CON-REPORT-001 (Report) | has-many | 1:N | Dashboard can embed report widgets |

## Invariants

- INV-CROSS-003: Dashboard ID is a UUID v7 (globally unique)
- INV-CROSS-001: Dashboard cannot directly access other context's database tables

## Business Rules

- Dashboard layout must be valid JSON configuration
- Shared dashboards are visible to users with appropriate permissions
- Dashboard refresh interval must be between 30 and 3600 seconds if set

## Events

- DashboardShared (CON-REPORT-010)
- DashboardCreated

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
- [Bounded Context Definition](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
