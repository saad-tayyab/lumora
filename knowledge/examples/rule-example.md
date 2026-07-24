---
id: EX-002
name: Example Business Rule Definition
type: rule-example
version: 1.0.0
---

# Example: Defining a Business Rule

This example demonstrates how to create a properly formatted business rule.

## Steps

1. Create file with correct naming convention
2. Add YAML front matter with all required fields
3. Write Statement, Rationale, Scope, Conditions, Pseudocode
4. Link to related concepts and rules
5. Run validation checklist

## File Naming

```
knowledge/rules/active/BR-001.journal-entry-must-balance.md
```

## YAML Front Matter

```yaml
---
id: BR-001
name: Journal Entry Must Balance
context: BC-FIN
priority: high
type: invariant
status: active
version: 1.0.0
owners:
  - CPA
  - Product Ontologist
concepts:
  - CON-FIN-003
  - CON-FIN-004
related_rules:
  - BR-002
tags:
  - accounting
  - double-entry
  - integrity
---
```

## Required Sections

1. **Statement** — The rule in plain English
2. **Rationale** — Why this rule exists
3. **Scope** — What it applies to
4. **Conditions** — WHEN/THEN/OTHERWISE format
5. **Pseudocode** — Implementation guidance
6. **Exceptions** — When the rule doesn't apply
7. **Related Rules** — Cross-references
8. **Implementation References** — Links to code

## Validation Checklist

- [ ] Rule ID follows `BR-{NUM}` format
- [ ] All referenced concept IDs exist
- [ ] All referenced rule IDs exist
- [ ] Pseudocode is provided
- [ ] Exceptions are documented
- [ ] Version bumped for any change
