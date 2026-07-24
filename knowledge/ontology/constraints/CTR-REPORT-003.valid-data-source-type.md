---
id: CTR-REPORT-003
concept: CON-REPORT-005
attribute: source_type
type: enum
scope: global
description: "DataSource type must be a valid predefined value"
severity: error
version: 1.0.0
---

# CTR-REPORT-003: Valid DataSource Type

## Definition

DataSource source_type must be one of the predefined enum values to ensure proper handling and query execution.

## Valid Values

- `database_view` — Direct database view query
- `api_endpoint` — External API endpoint
- `computed` — Calculated from other data sources
- `event_stream` — Streamed from domain events

## Validation

- Reject DataSource creation with invalid source_type
- Validate source_type on every update

## References

- [CON-REPORT-005](../contexts/BC-REPORT/CON-REPORT-005.data-source.md)
