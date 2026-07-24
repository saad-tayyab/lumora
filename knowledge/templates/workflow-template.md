---
template_id: TPL-002
name: Workflow Template
type: workflow
version: 1.0.0
description: Template for creating workflow definitions
---

# {{WORKFLOW_NAME}}

## Metadata

| Field | Value |
|-------|-------|
| ID | `{{WORKFLOW_ID}}` |
| Name | {{WORKFLOW_NAME}} |
| Context | {{BOUNDED_CONTEXT}} |
| Type | {{WORKFLOW_TYPE}} |
| Version | {{VERSION}} |
| Status | {{STATUS}} |
| Owners | {{OWNERS}} |

---

## Overview

{{OVERVIEW}}

---

## Trigger

- **Type:** {{TRIGGER_TYPE}}
- **Actor:** {{TRIGGER_ACTOR}}
- **Input:** {{TRIGGER_INPUT}}

---

## Participants

| Role | Responsibility |
|------|---------------|
| {{ROLE}} | {{RESPONSIBILITY}} |

---

## Steps

### Step 1: {{STEP_NAME}}

- **Action:** {{ACTION_DESCRIPTION}}
- **Input:** {{INPUT}}
- **Output:** {{OUTPUT}}
- **Rules:** {{RULES}}
- **On Failure:** {{FAILURE_HANDLING}}

### Step 2: {{STEP_NAME}}

- **Action:** {{ACTION_DESCRIPTION}}
- **Input:** {{INPUT}}
- **Output:** {{OUTPUT}}
- **Rules:** {{RULES}}
- **On Failure:** {{FAILURE_HANDLING}}

---

## Exception Handling

| Exception | Handler |
|-----------|---------|
| {{EXCEPTION}} | {{HANDLER}} |

---

## Data Flow

```mermaid
graph LR
    A[{{START}}] --> B[{{STEP_1}}]
    B --> C[{{STEP_2}}]
    C --> D[{{END}}]
```

---

## Related Workflows

- {{RELATED_WORKFLOW_ID}}: {{RELATED_WORKFLOW_NAME}}

---

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| {{VERSION}} | {{DATE}} | Initial definition | {{AUTHOR}} |
