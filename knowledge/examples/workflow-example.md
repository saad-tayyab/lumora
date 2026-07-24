---
id: EX-003
name: Example Workflow Definition
type: workflow-example
version: 1.0.0
---

# Example: Defining a Workflow

This example demonstrates how to create a properly formatted workflow.

## Steps

1. Create file with correct naming convention
2. Add YAML front matter with all required fields
3. Write Overview, Trigger, Participants, Steps
4. Create Mermaid diagram
5. Run validation checklist

## File Naming

```
knowledge/workflows/active/WF-AR-001.invoice-creation.md
```

## YAML Front Matter

```yaml
---
id: WF-AR-001
name: Invoice Creation Workflow
context: BC-AR
type: process
status: active
version: 1.0.0
owners:
  - CPA
  - Knowledge Engineer
trigger:
  type: command
  name: CreateInvoice
actors:
  - AccountsReceivable
  - System
related_rules:
  - BR-004
concepts:
  - CON-AR-001
  - CON-AR-002
---
```

## Required Sections

1. **Overview** — What this workflow does
2. **Trigger** — What initiates it
3. **Participants** — Who is involved
4. **Steps** — Ordered list with Action, Input, Output, On Failure
5. **Exception Handling** — What happens on errors
6. **Data Flow** — Mermaid diagram
7. **Related Workflows** — Cross-references

## Validation Checklist

- [ ] Workflow ID follows `WF-{CTX}-{NUM}` format
- [ ] All steps have Action, Input, Output, On Failure
- [ ] All referenced rule IDs exist
- [ ] Mermaid diagram is valid
- [ ] Exception handling is complete
- [ ] Version bumped for any change
