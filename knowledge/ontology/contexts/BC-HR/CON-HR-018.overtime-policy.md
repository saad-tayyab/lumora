---
id: CON-HR-018
name: OvertimePolicy
context: BC-HR
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - policies
  - time-tracking
---

# OvertimePolicy

## Definition

A business policy that defines the rules for calculating overtime hours and overtime pay rates. Determines when work hours exceed the standard workday threshold and applies the appropriate multiplier for overtime compensation.

## Policy Rules

1. **Standard Workday**: Standard working hours are 8 hours per day (configurable per tenant).
2. **Overtime Threshold**: Hours worked beyond the standard workday are classified as overtime.
3. **Overtime Rate**: Overtime hours are compensated at 1.5x the regular hourly rate (configurable).
4. **Maximum Daily Overtime**: Maximum overtime hours per day is capped (configurable, default 4 hours).
5. **Weekly Overtime**: If total weekly hours exceed 40, additional hours are overtime (configurable).
6. **Holiday Work**: Work on designated holidays is compensated at 2x the regular hourly rate.

## Policy Evaluation

| Condition | Action |
|-----------|--------|
| Daily hours ≤ standard_workday | No overtime |
| Daily hours > standard_workday | Overtime = daily_hours - standard_workday |
| Daily overtime > max_daily_overtime | Cap at max_daily_overtime |
| Weekly hours > 40 | Additional hours classified as weekly overtime |
| Work on holiday | All hours at holiday_rate |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| standard_workday_hours | decimal | 8.0 | Standard hours per day |
| overtime_multiplier | decimal | 1.5 | Overtime pay rate multiplier |
| holiday_multiplier | decimal | 2.0 | Holiday pay rate multiplier |
| max_daily_overtime | decimal | 4.0 | Maximum overtime hours per day |
| weekly_overtime_threshold | decimal | 40.0 | Weekly hours before overtime applies |

## Invariants

- INV-HR-048: Overtime multiplier must be ≥ 1.0.
- INV-HR-049: Standard workday hours must be positive.
- INV-HR-050: Max daily overtime must be non-negative.
- INV-HR-051: Policy configuration is tenant-specific.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
