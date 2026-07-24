---
id: CTR-REPORT-004
concept: CON-REPORT-006
attribute: cron_expression
type: pattern
scope: global
description: "ReportSchedule cron expression must be valid"
severity: error
version: 1.0.0
---

# CTR-004: Valid Cron Expression

## Definition

ReportSchedule cron_expression must be a valid 5 or 6 field cron expression for reliable schedule execution.

## Pattern

Standard cron format: `minute hour day-of-month month day-of-week [year]`

Examples:
- `0 9 * * 1` — Every Monday at 9:00 AM
- `0 0 1 * *` — First day of every month at midnight
- `0 */4 * * *` — Every 4 hours

## Validation

- Parse and validate cron expression before saving
- Reject invalid cron expressions with descriptive error

## References

- [CON-REPORT-006](../contexts/BC-REPORT/CON-REPORT-006.report-schedule.md)
