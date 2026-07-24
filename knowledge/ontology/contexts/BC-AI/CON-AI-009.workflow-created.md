---
id: CON-AI-009
name: WorkflowCreated
context: BC-AI
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - workflow
  - event
---

# WorkflowCreated

## Definition

A domain event emitted when a new Workflow is successfully created. Used for cross-context communication and audit trail.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| workflow_id | UUID v7 | yes | Created workflow reference |
| workflow_name | string(200) | yes | Workflow display name |
| created_by | UUID v7 | yes | User who created the workflow |
| tenant_id | UUID v7 | yes | Tenant owner |
| timestamp | timestamp | yes | Event emission timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-001 (Workflow) | refers-to | N:1 | Workflow that was created |

## Invariants

- INV-CROSS-003: Event ID is a globally unique UUID v7.
- INV-AI-019: WorkflowCreated must include workflow_id.

## Business Rules

- Events are immutable once emitted.
- Events are the only cross-context communication mechanism (INV-CROSS-002).

## Events

- None (this IS an event)

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md#7-event-catalog)
