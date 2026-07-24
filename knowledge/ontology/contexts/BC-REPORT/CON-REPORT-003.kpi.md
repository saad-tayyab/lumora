---
id: CON-REPORT-003
name: KPI
context: BC-REPORT
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - reporting
  - analytics
  - metrics
---

# KPI

## Definition

A Key Performance Indicator is a measurable value that demonstrates how effectively a business is achieving key objectives. KPIs are tracked over time and can trigger alerts when thresholds are breached.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant owning this KPI |
| name | string(200) | yes | KPI display name |
| description | text | no | KPI description |
| metric_type | enum | yes | financial, operational, inventory, hr |
| formula | text | no | Calculation formula or expression |
| unit | string(50) | no | Unit of measurement (e.g., currency, percentage, count) |
| target_value | numeric(19,4) | yes | Target/threshold value |
| warning_threshold | numeric(19,4) | no | Warning level threshold |
| critical_threshold | numeric(19,4) | no | Critical level threshold |
| direction | enum | yes | higher_is_better, lower_is_better, target_is_exact |
| current_value | numeric(19,4) | no | Latest calculated value |
| last_calculated_at | timestamp | no | When the value was last calculated |
| created_by | UUID v7 | yes | User who defined the KPI |
| created_at | timestamp | yes | Creation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-002 (Dashboard) | belongs-to | N:1 | KPI is displayed on a dashboard |
| CON-REPORT-001 (Report) | belongs-to | N:1 | KPI can be part of a report |

## Invariants

- INV-CROSS-003: KPI ID is a UUID v7 (globally unique)
- Warning threshold must be less than critical threshold when both are set

## Business Rules

- KPI values are calculated from data sources at configured intervals
- Threshold breaches trigger KPIBreached events
- KPI metric_type must be one of the predefined enum values

## Events

- KPIBreached (CON-REPORT-009)
- KPIUpdated

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
- [Financial Invariants](../../../constitution/DOMAIN.md#41-financial-invariants)
