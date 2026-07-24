---
id: CON-REPORT-005
name: DataSource
context: BC-REPORT
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - reporting
  - data
---

# DataSource

## Definition

An immutable value object representing a connection to a data provider. Data sources define how reports and KPIs retrieve their underlying data. Each data source encapsulates connection details and query configuration.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| source_id | UUID v7 | yes | Unique identifier |
| name | string(200) | yes | Data source display name |
| source_type | enum | yes | database_view, api_endpoint, computed, event_stream |
| context_ref | string(100) | yes | Reference to source bounded context (e.g., BC-FIN, BC-INV) |
| query_config | json | yes | Query or endpoint configuration |
| refresh_policy | enum | yes | realtime, periodic, on_demand |
| cache_ttl_seconds | integer | no | Cache time-to-live in seconds |
| is_active | boolean | yes | Whether the data source is currently active |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-001 (Report) | used-by | 1:N | Data source provides data to reports |
| CON-REPORT-003 (KPI) | used-by | 1:N | Data source provides data to KPIs |

## Invariants

- INV-CROSS-002: Data source references another context via events, not direct table access
- Context reference must match a valid bounded context ID
- Cache TTL must be positive when set

## Business Rules

- Data sources follow the DataRefreshPolicy for update frequency
- Inactive data sources cannot be used by new reports
- Query configuration must conform to the source_type requirements

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
- [Cross-Context Invariants](../../../constitution/DOMAIN.md#44-cross-context-invariants)
