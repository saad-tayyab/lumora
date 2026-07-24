---
id: CON-REPORT-011
name: GenerateReport
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
  - actions
---

# GenerateReport

## Definition

A command that initiates the generation of a report. Can be triggered manually by a user, automatically by a schedule, or programmatically via API.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| report_id | UUID v7 | yes | ID of the report to generate |
| tenant_id | UUID v7 | yes | Tenant context |
| triggered_by | UUID v7 | yes | User or system process |
| parameters | json | no | Runtime parameters for report generation |
| output_format | enum | no | Desired output format (default: template default) |
| priority | enum | no | low, normal, high (default: normal) |
| requested_at | timestamp | yes | When the command was issued |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-001 (Report) | targets | 1:1 | Command targets a specific report |

## Invariants

- Report must exist and be in active status
- Priority must be one of the predefined enum values

## Business Rules

- Commands are processed asynchronously
- Duplicate commands for the same report within 60 seconds are deduplicated
- High-priority commands are processed ahead of normal and low priority

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
