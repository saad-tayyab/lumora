---
id: CON-AI-001
name: Workflow
context: BC-AI
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - automation
  - workflow
  - core
---

# Workflow

## Definition

An aggregate root representing a sequence of automated steps that execute business processes. Workflows orchestrate tasks across bounded contexts and can be triggered by events or manual actions.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(200) | yes | Workflow display name |
| description | string(1000) | no | Workflow purpose description |
| status | enum | yes | draft, active, paused, completed, failed |
| trigger_type | enum | yes | event, manual, schedule, cron |
| created_by | UUID v7 | yes | User who created the workflow |
| tenant_id | UUID v7 | yes | Tenant owner |
| created_at | timestamp | yes | Creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-002 (WorkflowStep) | has-many | 1:N | Contains ordered steps |
| CON-AI-008 (AutomationTrigger) | has-one | 1:1 | Defines execution trigger |

## Invariants

- INV-AI-001: Workflow must have at least one WorkflowStep.
- INV-AI-002: Workflow status transitions must follow: draft -> active -> paused/completed/failed.
- INV-CROSS-003: Workflow ID is a globally unique UUID v7.

## Business Rules

- Workflows execute steps sequentially unless branching logic is defined.
- Paused workflows resume from the last completed step.

## Events

- WorkflowCreated (CON-AI-009)
- WorkflowCompleted
- WorkflowFailed

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
- [AI Constitution](../../constitution/AI.md)
