---
id: EX-001
name: Example Concept Definition
type: concept-example
version: 1.0.0
---

# Example: Defining a Concept

This example demonstrates how to create a properly formatted concept definition.

## Steps

1. Create file with correct naming convention
2. Add YAML front matter with all required fields
3. Write Definition, Attributes, Relationships, Invariants
4. Link to related rules and workflows
5. Run validation checklist

## File Naming

```
knowledge/ontology/contexts/BC-FIN/CON-FIN-001.chart-of-accounts.md
```

## YAML Front Matter

```yaml
---
id: CON-FIN-001
name: Chart of Accounts
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounting
  - financial
  - core
---
```

## Required Sections

1. **Definition** — Clear, concise description
2. **Attributes** — Table of all attributes with types
3. **Relationships** — Links to other concepts
4. **Invariants** — Rules that must always be true
5. **Business Rules** — Applicable business rules
6. **Events** — Domain events produced
7. **References** — Links to implementation

## Validation Checklist

- [ ] Concept ID follows `CON-{CTX}-{NUM}` format
- [ ] File name matches concept name in kebab-case
- [ ] YAML front matter contains all required fields
- [ ] Bounded context exists in DOMAIN.md
- [ ] All relationships reference valid concept IDs
- [ ] No duplicate concept IDs
- [ ] Cross-references are bidirectional
- [ ] Version bumped for any change
