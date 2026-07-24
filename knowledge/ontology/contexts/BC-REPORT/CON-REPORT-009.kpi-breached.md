---
id: CON-REPORT-009
name: KPIBreached
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
  - alerts
---

# KPIBreached

## Definition

A domain event emitted when a KPI value crosses a defined threshold (warning or critical). This event enables automated alerting and corrective action workflows.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| kpi_id | UUID v7 | yes | ID of the breached KPI |
| tenant_id | UUID v7 | yes | Tenant context |
| threshold_type | enum | yes | warning, critical |
| threshold_value | numeric(19,4) | yes | The threshold that was breached |
| actual_value | numeric(19,4) | yes | The actual KPI value |
| direction | enum | yes | above, below |
| breached_at | timestamp | yes | When the breach was detected |
| previous_value | numeric(19,4) | no | Previous KPI value |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-003 (KPI) | triggers | 1:1 | Event is caused by KPI threshold breach |

## Invariants

- Threshold value must match the KPI's defined threshold
- Actual value must be on the breach side of the threshold

## Business Rules

- Critical breaches trigger immediate notifications
- Warning breaches may be batched for periodic notification
- Duplicate breaches within a cooldown period are suppressed

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
- [Event Catalog](../../../constitution/DOMAIN.md#7-event-catalog)
