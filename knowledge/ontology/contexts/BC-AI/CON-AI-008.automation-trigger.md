---
id: CON-AI-008
name: AutomationTrigger
context: BC-AI
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - automation
  - trigger
---

# AutomationTrigger

## Definition

An immutable value object defining the conditions under which a Workflow is automatically executed. Supports event-based, schedule-based, and manual trigger types.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| trigger_type | enum | yes | event, schedule, manual, webhook |
| event_name | string(200) | no | Domain event name (for event triggers) |
| schedule_cron | string(100) | no | Cron expression (for schedule triggers) |
| conditions | json | no | Additional filter conditions |
| enabled | boolean | yes | Whether trigger is active |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-001 (Workflow) | triggers | N:1 | Workflow to execute |

## Invariants

- INV-AI-016: Event triggers must specify event_name.
- INV-AI-017: Schedule triggers must specify schedule_cron.
- INV-AI-018: Only one active trigger per workflow.

## Business Rules

- Disabled triggers do not fire.
- Event triggers must reference valid domain events.

## Events

- None (value object)

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
