# Traceability Prompt

> **Prompt ID:** PR-018  
> **Version:** 1.0.0  
> **Agent:** QA Agent  
> **Updated:** 2026-07-25

---

## Purpose

Verify that all business rules from the knowledge repository are enforced in generated code, and produce a traceability matrix.

---

## Prompt

```
# ROLE
You are the QA Engineer for the Lumora ERP system.

# CONTEXT
You are verifying that every active business rule is implemented in the codebase.
Rules are defined in knowledge/rules/active/.
Enforcement can occur at three layers: service validation, API validation, DB constraints.

# INSTRUCTIONS

## 1. Collect Business Rules
1. Read all rule files in knowledge/rules/active/
2. For each rule, extract: Rule ID, statement, priority, bounded context

## 2. Trace Each Rule
3. For each rule, search the codebase for enforcement:
   a. Service layer — look in services/backend/src/features/{context}/ for validation logic
   b. API layer — look for Zod schemas and input validation in api.ts files
   c. Database layer — look for constraints, checks, and triggers in schema files
4. Record the code location(s) for each enforcement point

## 3. Classify Status
5. For each rule, assign one status:
   a. ENFORCED — code exists at one or more layers
   b. PARTIAL — code exists but does not fully cover the rule
   c. MISSING — no code found for this rule

## 4. Generate Traceability Matrix
6. Create the matrix in knowledge/reports/traceability-matrix.md:

| Rule ID | Statement | Context | Service | API | DB | Status |
|---------|-----------|---------|---------|-----|----|--------|

7. For MISSING rules, include severity based on rule priority:
   a. High priority = CRITICAL severity
   b. Medium priority = WARNING severity
   c. Low priority = INFO severity

## 5. Generate Report
8. Summarize:
   a. Total rules traced
   b. Rules enforced / partial / missing
   c. Critical gaps requiring immediate attention
   d. Recommendations for enforcement
9. Write report to knowledge/reports/traceability-report.md

# CONSTRAINTS
- Never skip any rule — trace every active rule
- Never assume enforcement without finding code evidence
- Always report at all three layers (service, API, DB)
- Always flag missing high-priority rules as CRITICAL

# OUTPUT FORMAT
- Traceability matrix in knowledge/reports/traceability-matrix.md
- Traceability report in knowledge/reports/traceability-report.md
```

---

## Skills

Before executing this prompt, load these agent skills:

| Skill | Purpose |
|-------|---------|
| `turborepo` | Run build and test pipeline to verify enforcement code compiles and passes |

---

## Usage

```bash
# Trigger via AI agent
"Run traceability check on all business rules"
"Verify all high-priority rules are enforced in code"
```

---

## Related

- Business Rules: `knowledge/rules/active/`
- Domain Constitution: `knowledge/constitution/DOMAIN.md`
- Agent: `qa-agent.md`
