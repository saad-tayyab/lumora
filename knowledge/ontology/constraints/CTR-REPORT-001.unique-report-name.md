---
id: CTR-REPORT-001
concept: CON-REPORT-001
attribute: name
type: unique
scope: tenant_id
description: "Report names must be unique within a tenant"
severity: error
version: 1.0.0
---

# CTR-REPORT-001: Unique Report Name per Tenant

## Definition

Report names must be unique within a tenant to prevent confusion and ensure clear identification.

## Scope

- Applies to all Reports within a single tenant
- Does not restrict names across different tenants

## Validation

- Check uniqueness before creating or renaming a Report
- Return error if duplicate name exists within the tenant

## References

- [CON-REPORT-001](../contexts/BC-REPORT/CON-REPORT-001.report.md)
