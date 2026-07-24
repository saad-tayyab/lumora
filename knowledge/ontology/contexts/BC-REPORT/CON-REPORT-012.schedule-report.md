---
id: CON-REPORT-012
name: ScheduleReport
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
  - scheduling
---

# ScheduleReport

## Definition

A command that creates or updates a report schedule. Defines when and how a report should be automatically generated and distributed.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| report_id | UUID v7 | yes | ID of the report to schedule |
| tenant_id | UUID v7 | yes | Tenant context |
| cron_expression | string(100) | yes | Cron expression for schedule |
| timezone | string(50) | yes | Timezone for execution |
| delivery_method | enum | yes | email, storage, api_webhook |
| delivery_config | json | no | Delivery destination configuration |
| is_active | boolean | yes | Whether the schedule should be active |
| requested_by | UUID v7 | yes | User requesting the schedule |
| requested_at | timestamp | yes | When the command was issued |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-006 (ReportSchedule) | targets | 1:1 | Command creates/updates a schedule |

## Invariants

- Cron expression must be valid
- Report must exist and be in active status

## Business Rules

- Updating an existing schedule replaces all fields
- Deactivating a schedule cancels pending executions
- Schedule changes take effect from the next calculated run time

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
