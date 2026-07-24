---
id: CON-REPORT-015
name: ReportRetentionPolicy
context: BC-REPORT
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - reporting
  - policies
  - retention
  - compliance
---

# ReportRetentionPolicy

## Definition

A business policy that governs how long generated reports and exports are retained before automatic cleanup. Ensures compliance with data retention requirements while managing storage costs.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| policy_id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant owning this policy |
| name | string(200) | yes | Policy display name |
| description | text | no | Policy description |
| report_type | enum | yes | all, financial, operational, inventory, hr |
| retention_days | integer | yes | Number of days to retain reports |
| export_retention_days | integer | yes | Number of days to retain export files |
| archive_before_delete | boolean | yes | Whether to archive before permanent deletion |
| archive_retention_days | integer | no | Days to keep archived copies |
| is_active | boolean | yes | Whether the policy is active |
| created_at | timestamp | yes | Creation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-001 (Report) | enforces | 1:N | Policy applies to generated reports |

## Invariants

- Retention days must be at least 1
- Export retention days must be at least 1
- Archive retention days must be greater than report retention days when archiving is enabled

## Business Rules

- Financial reports may have longer retention periods for compliance
- Policy evaluation runs daily as a background job
- Deleted reports are soft-deleted for 30 days before permanent removal
- Audit log entries for deleted reports are retained indefinitely

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
- [Financial Invariants](../../../constitution/DOMAIN.md#41-financial-invariants)
