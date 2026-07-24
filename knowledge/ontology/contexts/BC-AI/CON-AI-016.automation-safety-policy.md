---
id: CON-AI-016
name: AutomationSafetyPolicy
context: BC-AI
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - automation
  - policy
  - safety
---

# AutomationSafetyPolicy

## Definition

A business policy defining safety constraints for automated workflows. Ensures human oversight, rollback capability, and resource limits for AI-driven automation.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| max_concurrent_workflows | integer | yes | Maximum simultaneous workflow executions |
| require_approval_above | decimal(12,2) | no | Financial threshold requiring human approval |
| max_auto_actions_per_hour | integer | yes | Rate limit for automated actions |
| rollback_enabled | boolean | yes | Whether failed workflows can be rolled back |
| audit_all_actions | boolean | yes | Whether all actions are logged for audit |
| escalation_timeout_minutes | integer | yes | Minutes before escalating to human |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-001 (Workflow) | enforces | 1:N | Workflows subject to this policy |

## Invariants

- INV-AI-031: max_concurrent_workflows must be greater than 0.
- INV-AI-032: max_auto_actions_per_hour must be greater than 0.
- INV-AI-033: Policy is enforced at workflow execution time.

## Business Rules

- Workflows exceeding concurrent limits are queued.
- Financial actions above threshold require human approval.
- All automated actions are audit-logged.
- Failed workflows trigger rollback if enabled.

## Events

- PolicyViolation on enforcement failure
- ApprovalRequired when threshold exceeded

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
- [AI Constitution](../../constitution/AI.md)
