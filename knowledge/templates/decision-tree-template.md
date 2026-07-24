---
template_id: TPL-010
name: Decision Tree Template
type: decision-tree
version: 1.0.0
description: Template for creating decision tree definitions
---

# {{DECISION_TREE_NAME}}

## Metadata

| Field | Value |
|-------|-------|
| Name | {{DECISION_TREE_NAME}} |
| Context | {{BOUNDED_CONTEXT}} |
| Version | {{VERSION}} |
| Status | {{STATUS}} |

---

## Purpose

{{PURPOSE}}

---

## Decision Flow

```mermaid
graph TD
    A[{{START_QUESTION}}] -->|{{ANSWER_1}}| B[{{DECISION_1}}]
    A -->|{{ANSWER_2}}| C[{{DECISION_2}}]
    B -->|{{ANSWER_3}}| D[{{OUTCOME_1}}]
    B -->|{{ANSWER_4}}| E[{{OUTCOME_2}}]
    C -->|{{ANSWER_5}}| F[{{OUTCOME_3}}]
    C -->|{{ANSWER_6}}| G[{{OUTCOME_4}}]
```

---

## Decision Points

### Decision Point 1: {{DECISION_NAME}}

**Question:** {{QUESTION}}

| Answer | Next Step | Rule |
|--------|-----------|------|
| {{ANSWER_1}} | {{NEXT_STEP_1}} | {{RULE_1}} |
| {{ANSWER_2}} | {{NEXT_STEP_2}} | {{RULE_2}} |

---

## Outcomes

| Outcome | Description | Action |
|---------|-------------|--------|
| {{OUTCOME_NAME}} | {{DESCRIPTION}} | {{ACTION}} |

---

## Business Rules

- {{RULE_ID}}: {{RULE_DESCRIPTION}}

---

## Related Workflows

- {{WORKFLOW_ID}}: {{WORKFLOW_NAME}}

---

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| {{VERSION}} | {{DATE}} | Initial definition | {{AUTHOR}} |
