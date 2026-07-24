---
id: CON-AI-012
name: CreateWorkflow
context: BC-AI
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - workflow
  - command
---

# CreateWorkflow

## Definition

A command representing the intent to create a new Workflow. Encapsulates all required data for workflow creation and validation.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string(200) | yes | Workflow display name |
| description | string(1000) | no | Workflow purpose description |
| trigger_type | enum | yes | event, manual, schedule, cron |
| steps | array<WorkflowStepData> | yes | Initial workflow steps |
| created_by | UUID v7 | yes | User creating the workflow |
| tenant_id | UUID v7 | yes | Tenant owner |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-001 (Workflow) | creates | 1:1 | Workflow to be created |
| CON-AI-009 (WorkflowCreated) | produces | 1:1 | Event emitted on success |

## Invariants

- INV-AI-022: Command must include at least one step.
- INV-AI-023: Created_by must reference a valid user.

## Business Rules

- Command validation occurs before workflow creation.
- Invalid commands are rejected with descriptive errors.

## Events

- WorkflowCreated (CON-AI-009) on success

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
