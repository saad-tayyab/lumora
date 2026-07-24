---
template_id: TPL-001
name: Concept Template
type: ontology
version: 1.0.0
description: Template for creating ontology concept definitions
---

# {{CONCEPT_NAME}}

## Metadata

| Field | Value |
|-------|-------|
| ID | `{{CONCEPT_ID}}` |
| Name | {{CONCEPT_NAME}} |
| Context | {{BOUNDED_CONTEXT}} |
| Type | {{CONCEPT_TYPE}} |
| Version | {{VERSION}} |
| Status | {{STATUS}} |
| Owners | {{OWNERS}} |

---

## Definition

{{DEFINITION}}

---

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| {{ATTRIBUTE_NAME}} | {{ATTRIBUTE_TYPE}} | {{REQUIRED}} | {{DESCRIPTION}} |

---

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| {{TARGET_CONCEPT}} | {{RELATIONSHIP_TYPE}} | {{CARDINALITY}} | {{DESCRIPTION}} |

---

## Invariants

- {{INVARIANT_ID}}: {{INVARIANT_DESCRIPTION}}

---

## Business Rules

- {{RULE_ID}}: {{RULE_DESCRIPTION}}

---

## Events

- {{EVENT_NAME}}: {{EVENT_DESCRIPTION}}

---

## References

- [Domain Constitution](../../constitution/DOMAIN.md#{{SECTION}})
- [Database Schema](../../packages/database/src/features/{{CONTEXT}}/{{TABLE}}.ts)

---

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| {{VERSION}} | {{DATE}} | Initial definition | {{AUTHOR}} |
