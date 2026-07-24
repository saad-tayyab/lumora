---
id: CON-REPORT-006
name: ReportSchedule
context: BC-REPORT
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - reporting
  - scheduling
  - automation
---

# ReportSchedule

## Definition

An entity that defines when and how a report should be automatically generated and distributed. Schedules enable recurring report generation without manual intervention.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| report_id | UUID v7 | yes | Reference to the report to schedule |
| tenant_id | UUID v7 | yes | Tenant owning this schedule |
| cron_expression | string(100) | yes | Cron expression defining the schedule |
| timezone | string(50) | yes | Timezone for schedule execution |
| is_active | boolean | yes | Whether the schedule is currently active |
| next_run_at | timestamp | no | Calculated next execution time |
| last_run_at | timestamp | no | Last execution timestamp |
| delivery_method | enum | yes | email, storage, api_webhook |
| delivery_config | json | no | Delivery destination configuration |
| created_by | UUID v7 | yes | User who created the schedule |
| created_at | timestamp | yes | Creation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-001 (Report) | belongs-to | N:1 | Schedule references a report |

## Invariants

- INV-CROSS-003: ReportSchedule ID is a UUID v7
- Cron expression must be valid
- Next run time must be in the future when schedule is active

## Business Rules

- Active schedules trigger GenerateReport commands at the configured time
- Failed schedule executions are logged and retried up to 3 times
- Delivery config must match the delivery_method requirements

## Events

- ScheduleActivated
- ScheduleDeactivated
- ScheduleExecutionFailed

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
