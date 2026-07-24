---
id: CTR-REPORT-005
concept: CON-REPORT-002
attribute: title
type: required
scope: global
description: "Dashboard title must always be provided"
severity: error
version: 1.0.0
---

# CTR-REPORT-005: Dashboard Title Required

## Definition

Every Dashboard must have a non-empty title for clear identification and display.

## Scope

- Applies to all Dashboards across all tenants

## Validation

- Reject Dashboard creation or update without a title
- Title must be between 1 and 200 characters

## References

- [CON-REPORT-002](../contexts/BC-REPORT/CON-REPORT-002.dashboard.md)
