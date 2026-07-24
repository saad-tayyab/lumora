# Pre-merge Checklist

> **Checklist ID:** CL-001  
> **Purpose:** Quality gates before merging a pull request  
> **Version:** 1.0.0

---

## Required Checks

### Code Quality
- [ ] `bunx @biomejs/biome check .` passes with 0 errors
- [ ] No `any` types in new code
- [ ] All functions have explicit return types
- [ ] Error handling is present for all operations

### Testing
- [ ] Unit tests added/updated
- [ ] All unit tests pass
- [ ] Integration tests added (if applicable)
- [ ] E2E tests added (if applicable)
- [ ] Test coverage meets 80% minimum

### Documentation
- [ ] README.md updated (if applicable)
- [ ] AI.md updated (if applicable)
- [ ] Inline comments where necessary
- [ ] CHANGELOG.md updated

### Knowledge Repository
- [ ] No new business rules invented
- [ ] All referenced concept IDs exist
- [ ] All referenced rule IDs exist
- [ ] No orphans created

### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] No SQL injection vectors
- [ ] Authentication/authorization checked

### Architecture
- [ ] Follows Clean Architecture layers
- [ ] No circular dependencies
- [ ] Bounded context isolation maintained
- [ ] SOLID principles followed

## Approval

- [ ] All checks pass
- [ ] Code review approved
- [ ] No merge conflicts
- [ ] CI pipeline green
