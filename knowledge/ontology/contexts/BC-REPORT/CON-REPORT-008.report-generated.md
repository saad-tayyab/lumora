---
id: CON-REPORT-008
name: ReportGenerated
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
---

# ReportGenerated

## Definition

A domain event emitted when a report has been successfully generated. This event triggers downstream processes such as export delivery, notification, and archival.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| report_id | UUID v7 | yes | ID of the generated report |
| tenant_id | UUID v7 | yes | Tenant context |
| template_id | UUID v7 | yes | Template used for generation |
| generated_by | UUID v7 | yes | User or system process that triggered generation |
| generated_at | timestamp | yes | When the report was generated |
| row_count | integer | no | Number of data rows in the report |
| execution_time_ms | integer | no | Time taken to generate the report |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-001 (Report) | triggers | 1:1 | Event is caused by report generation |

## Invariants

- Event timestamp must be in the past or present
- Report ID must reference an existing report

## Business Rules

- This event is emitted after successful report generation
- Failed generations emit ReportGenerationFailed instead
- Events are immutable once published

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
- [Event Catalog](../../../constitution/DOMAIN.md#7-event-catalog)
