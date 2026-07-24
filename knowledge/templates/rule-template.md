---
template_id: TPL-003
name: Business Rule Template
type: rule
version: 1.0.0
description: Template for creating business rule definitions
---

# {{RULE_NAME}}

## Metadata

| Field | Value |
|-------|-------|
| ID | `{{RULE_ID}}` |
| Name | {{RULE_NAME}} |
| Context | {{BOUNDED_CONTEXT}} |
| Priority | {{PRIORITY}} |
| Type | {{RULE_TYPE}} |
| Version | {{VERSION}} |
| Status | {{STATUS}} |
| Owners | {{OWNERS}} |

---

## Statement

{{STATEMENT}}

---

## Rationale

{{RATIONALE}}

---

## Scope

- **Applies to:** {{SCOPE}}
- **Bounded Context:** {{BOUNDED_CONTEXT}}
- **Entities:** {{ENTITIES}}

---

## Conditions

- **WHEN** {{CONDITION}}
- **THEN** {{ACTION}}
- **OTHERWISE** {{FAILURE}}

---

## Pseudocode

```
{{PSEUDOCODE}}
```

---

## Exceptions

{{EXCEPTIONS}}

---

## Related Rules

- {{RELATED_RULE_ID}}: {{RELATED_RULE_DESCRIPTION}}

---

## Related Concepts

- {{CONCEPT_ID}}: {{CONCEPT_NAME}}

---

## Implementation References

- [Domain Invariant](../../constitution/DOMAIN.md#{{INVARIANT_ID}})
- [Service](../../services/backend/src/features/{{CONTEXT}}/{{SERVICE}}.ts)
- [Test](../../services/backend/src/features/{{CONTEXT}}/{{SERVICE}}.test.ts)

---

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| {{VERSION}} | {{DATE}} | Initial definition | {{AUTHOR}} |
