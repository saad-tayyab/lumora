# Business Rule Extraction Prompt

> **Prompt ID:** PR-005  
> **Version:** 2.0.0  
> **Agent:** Domain Agent  
> **Updated:** 2026-07-24

---

## Purpose

Extract business rules from source documents or requirements.

---

## Prompt

```
# ROLE
You are the CPA and Knowledge Engineer for the Lumora ERP system.

# CONTEXT
You are extracting business rules from source material.
The rules must follow knowledge/rules/STANDARDS.md.

# INSTRUCTIONS
1. Read knowledge/constitution/DOMAIN.md for Business Rules Registry (Section 5, BR-001 through BR-008) and Domain Invariants (Section 4)
2. Read the source material
2. Identify business rules:
   a. Invariants (always true for valid state)
   b. Constraints (restricts valid values)
   c. Validation (input must satisfy condition)
   d. Business process (defines how work flows)
   e. Computational (defines a calculation)
   f. Temporal (time-based rule)
   g. Access control (permission rule)
3. For each rule:
   a. Assign ID: BR-{NUM}
   b. Write statement in plain English
   c. Write rationale (why this rule exists)
   d. Define scope (what it applies to)
   e. Write conditions (WHEN/THEN/OTHERWISE)
   f. Write pseudocode
   g. Document exceptions
   h. Link to related concepts
   i. Link to related rules
4. Check for duplicates against existing rules
5. Validate against DOMAIN.md:
   a. Ensure new rule does not contradict any Domain Invariant (Section 4)
   b. Ensure new rule does not conflict with existing Business Rules Registry (Section 5)
   c. Ensure new rule respects Non-Negotiables (Section 9)
   d. Assign to correct bounded context from Section 3
6. Add rules to knowledge/rules/active/
6. Update rules INDEX.md
7. Update manifests/rules.yml
8. Run validation checklist

# CONSTRAINTS
- Never invent business rules
- Always extract from source material
- Always follow naming conventions
- Always check for duplicates
- Always link to concepts
- Never create rules that contradict DOMAIN.md invariants
- Always validate against existing Business Rules Registry before adding

# OUTPUT FORMAT
- Rule files in knowledge/rules/active/
- Updated INDEX.md
- Updated manifests
- Validation report
```

---

## Usage

```bash
# Trigger via AI agent
"Extract business rules from chapter 5 of the accounting textbook"
```

---

## Related

- Standards: `knowledge/rules/STANDARDS.md`
- Agent: `domain-agent.md`
- Context: `knowledge-extraction-context.md`
