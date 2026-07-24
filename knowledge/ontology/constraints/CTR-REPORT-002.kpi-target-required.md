---
id: CTR-REPORT-002
concept: CON-REPORT-003
attribute: target_value
type: required
scope: global
description: "KPI target value must always be defined"
severity: error
version: 1.0.0
---

# CTR-REPORT-002: KPI Target Value Required

## Definition

Every KPI must have a defined target value to enable threshold comparison and breach detection.

## Scope

- Applies to all KPIs across all tenants

## Validation

- Reject KPI creation or update without a target_value
- Target value must be a valid numeric value

## References

- [CON-REPORT-003](../contexts/BC-REPORT/CON-REPORT-003.kpi.md)
