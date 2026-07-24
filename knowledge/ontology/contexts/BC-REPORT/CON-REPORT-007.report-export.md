---
id: CON-REPORT-007
name: ReportExport
context: BC-REPORT
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - reporting
  - export
  - formatting
---

# ReportExport

## Definition

An immutable value object representing the output configuration and result of exporting a report to a specific format. Captures the format, file metadata, and storage location of the exported report.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| export_id | UUID v7 | yes | Unique identifier |
| report_id | UUID v7 | yes | Reference to the source report |
| format | enum | yes | pdf, csv, xlsx, html, json |
| file_name | string(255) | yes | Generated file name |
| file_size_bytes | bigint | no | Size of the exported file |
| storage_path | string(500) | no | Path in storage system (e.g., R2) |
| status | enum | yes | pending, completed, failed |
| requested_by | UUID v7 | yes | User who requested the export |
| requested_at | timestamp | yes | When the export was requested |
| completed_at | timestamp | no | When the export completed |
| expires_at | timestamp | no | When the export file expires |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-001 (Report) | belongs-to | N:1 | Export is derived from a report |

## Invariants

- Export format must be one of the formats supported by the report's template
- Completed exports must have a storage_path
- File size must be positive when completed

## Business Rules

- Export files are automatically cleaned up after expiration
- Failed exports can be retried
- Large reports may be paginated in the export

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
