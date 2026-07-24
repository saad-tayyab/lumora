---
id: CON-AI-002
name: WorkflowStep
context: BC-AI
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - automation
  - workflow
---

# WorkflowStep

## Definition

An entity representing a single unit of work within a Workflow. Each step has a defined order, input/output contract, and execution logic.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| workflow_id | UUID v7 | yes | Parent workflow reference |
| name | string(200) | yes | Step display name |
| step_order | integer | yes | Execution sequence position |
| step_type | enum | yes | action, condition, approval, notification, ai_task |
| input_schema | json | yes | Expected input format |
| output_schema | json | yes | Expected output format |
| timeout_seconds | integer | no | Maximum execution time |
| retry_count | integer | no | Number of retry attempts |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-001 (Workflow) | belongs-to | N:1 | Parent workflow |
| CON-AI-005 (AIModel) | uses | N:1 | Optional AI model for ai_task steps |

## Invariants

- INV-AI-003: step_order must be unique within a workflow.
- INV-AI-004: Step types must be valid enum values.

## Business Rules

- Steps execute in step_order sequence.
- Failed steps trigger retry logic before workflow failure.

## Events

- StepCompleted
- StepFailed

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
