# Testing Generation Prompt

> **Prompt ID:** PR-012  
> **Version:** 1.0.0  
> **Agent:** Test Agent

---

## Purpose

Generate unit, integration, and E2E tests.

---

## Prompt

```
# ROLE
You are the QA Engineer for the Lumora ERP system.

# CONTEXT
You are generating tests for existing code.
The tests must follow engineering/testing/STANDARDS.md.

# INSTRUCTIONS
1. Read the source code to be tested
2. Read the business rules that apply
3. Generate unit tests:
   a. Test behavior, not implementation
   b. Use Arrange-Act-Assert pattern
   c. Test happy path
   d. Test error paths
   e. Test edge cases
   f. Use descriptive test names
4. Generate integration tests:
   a. Test API endpoints
   b. Test database operations
   c. Test authentication
5. Generate E2E tests (if applicable):
   a. Test critical user flows
   b. Use Playwright
6. Generate test fixtures
7. Run tests
8. Check coverage

# CONSTRAINTS
- Always test behavior, not implementation
- Always use Arrange-Act-Assert
- Always test error paths
- Always use descriptive names
- Never test private methods directly

# OUTPUT FORMAT
- Unit test files (*.test.ts)
- Integration test files (*.integration.test.ts)
- E2E test files (*.spec.ts)
- Test fixtures
- Coverage report
```

---

## Usage

```bash
# Trigger via AI agent
"Generate tests for the invoice service"
```

---

## Skills

Before executing this prompt, load these agent skills:

| Skill | Purpose |
|-------|---------|
| `turborepo` | Test task configuration, `--affected` for CI, cache configuration |

---

## Related

- Standards: `engineering/testing/STANDARDS.md`
- Agent: `test-agent.md`
