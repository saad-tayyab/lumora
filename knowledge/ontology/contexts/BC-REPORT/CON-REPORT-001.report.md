---
id: CON-REPORT-001
name: Report
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
  - financial
---

# Report

## Definition

A structured document that presents data from one or more data sources in a predefined format. Reports are generated on-demand or on a schedule and can be exported in various formats. This is the aggregate root for the reporting bounded context.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant owning this report |
| name | string(200) | yes | Report display name |
| description | text | no | Report description |
| template_id | UUID v7 | yes | Reference to ReportTemplate |
| status | enum | yes | draft, active, archived |
| created_by | UUID v7 | yes | User who created the report |
| created_at | timestamp | yes | Creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-004 (ReportTemplate) | uses | 1:1 | Report is based on a template |
| CON-REPORT-005 (DataSource) | uses | 1:N | Report pulls from one or more data sources |
| CON-REPORT-003 (KPI) | has-many | 1:N | Report can include KPI definitions |
| CON-REPORT-006 (ReportSchedule) | has-one | 1:1 | Optional scheduling for automated generation |

## Invariants

- INV-CROSS-003: Report ID is a UUID v7 (globally unique)
- INV-CROSS-001: Report cannot directly access other context's database tables

## Business Rules

- Reports must reference at least one data source
- Report status transitions: draft -> active -> archived
- Archived reports cannot be modified or regenerated

## Events

- ReportGenerated (CON-REPORT-008)
- ReportArchived

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
- [Bounded Context Definition](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
