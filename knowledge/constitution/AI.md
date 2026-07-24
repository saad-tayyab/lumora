# AI Constitution

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** AI Systems Engineer + Knowledge Engineer  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This constitution defines how AI operates within the Lumora development ecosystem. It governs prompt engineering, knowledge management, agent behavior, and the boundaries of AI autonomy.

---

## 2. AI Design Principles

### 2.1 Knowledge-First

- All AI outputs originate from the knowledge repository.
- AI never invents business rules; it references existing ones.
- AI maintains the knowledge graph as a first-class citizen.

### 2.2 Transparency

- Every AI-generated artifact must declare its source knowledge.
- AI reasoning must be auditable via the memory system.
- AI decisions that affect production require human approval.

### 2.3 Incremental Generation

- Never generate everything at once.
- Each phase produces validated, internally consistent output.
- Quality gates must pass before phase advancement.

### 2.4 Human-in-the-Loop

- AI proposes; humans approve.
- AI executes within defined boundaries.
- AI escalates ambiguity to humans.

---

## 3. Agent Architecture

### 3.1 Agent Types

| Agent | Purpose | Autonomy Level |
|-------|---------|---------------|
| Architect Agent | System design, ADR generation | Advisory |
| Domain Agent | Business rule extraction, ontology | Advisory |
| Code Agent | Code generation, refactoring | Execution (with review) |
| Test Agent | Test generation, coverage analysis | Execution |
| Doc Agent | Documentation generation | Execution |
| QA Agent | Quality gate enforcement | Execution |
| Review Agent | Code review, security audit | Advisory |

### 3.2 Agent Rules

1. **Single responsibility.** Each agent does one thing well.
2. **Stateless where possible.** Use memory system for persistence.
3. **Idempotent operations.** Re-running an agent produces the same result.
4. **Graceful degradation.** If an agent fails, the pipeline continues with degraded output.
5. **No autonomous production deploys.** All deployments require human approval.

---

## 4. Prompt Engineering Standards

### 4.1 Prompt Structure

```markdown
# ROLE
[Define the expert persona]

# CONTEXT
[Provide relevant project context]

# INSTRUCTIONS
[Clear, numbered steps]

# CONSTRAINTS
[What NOT to do]

# OUTPUT FORMAT
[Expected structure]

# EXAMPLES
[When helpful]
```

### 4.2 Prompt Rules

1. **Never assume business rules.** Always reference the constitution.
2. **Always include the output format.** LLMs need structure.
3. **Use YAML front matter** in all generated documents.
4. **Cross-reference** to other knowledge artifacts.
5. **Version prompts** alongside code.

### 4.3 Prompt Registry

| Prompt ID | Name | Version | Used By |
|-----------|------|---------|---------|
| PR-001 | Repository Bootstrap | 1.0 | Architect Agent |
| PR-002 | PDF Ingestion | 1.0 | Domain Agent |
| PR-003 | Knowledge Extraction | 1.0 | Domain Agent |
| PR-004 | Ontology Generation | 1.0 | Domain Agent |
| PR-005 | Business Rule Extraction | 1.0 | Domain Agent |
| PR-006 | Code Generation | 1.0 | Code Agent |
| PR-007 | Test Generation | 1.0 | Test Agent |
| PR-008 | Documentation Generation | 1.0 | Doc Agent |
| PR-009 | Security Review | 1.0 | Review Agent |
| PR-010 | Performance Analysis | 1.0 | QA Agent |

---

## 5. Knowledge Integration

### 5.1 Knowledge Pipeline

```
Input (PDF/Text/Source)
  → Extraction (AI-assisted)
  → Normalization (Schema validation)
  → Deduplication (Similarity matching)
  → Ontology Update (Graph insertion)
  → Business Rule Extraction
  → Workflow Generation
  → Code Generation
  → Validation
  → Human Review
```

### 5.2 Knowledge Graph Rules

- Every node has a unique ID following naming conventions.
- Every relationship is typed and directional.
- Orphan nodes are prohibited.
- Circular dependencies must be flagged.

### 5.3 Business Rule Extraction

1. Identify rule in source material.
2. Assign Rule ID following convention.
3. Link to relevant bounded context.
4. Define priority and constraints.
5. Cross-reference related rules.
6. Validate no duplicates exist.

---

## 6. Memory System

### 6.1 Memory Types

| Type | Purpose | Persistence |
|------|---------|-------------|
| Working Memory | Current task context | Session |
| Short-term Memory | Recent decisions, intermediate results | Per-run |
| Long-term Memory | Project conventions, learned patterns | Permanent |
| Episodic Memory | Past conversations, debugging sessions | Indexed |

### 6.2 Memory Rules

1. **No memory without index.** Every memory entry must be searchable.
2. **No stale memory.** Regularly prune outdated entries.
3. **Memory is append-only.** Never delete; mark as superseded.
4. **Memory respects constitution.** Memory cannot contradict constitutions.

---

## 7. Quality Gates for AI Output

### 7.1 Pre-Generation

- [ ] Input references valid knowledge artifacts.
- [ ] Prompt follows standard structure.
- [ ] Context includes relevant constitution rules.

### 7.2 Post-Generation

- [ ] No business rules invented.
- [ ] All IDs follow naming conventions.
- [ ] Cross-references are valid.
- [ ] YAML front matter present.
- [ ] No broken links.
- [ ] Terminology matches glossary.
- [ ] Machine-readable format.
- [ ] Human-readable format.

### 7.3 Validation

- [ ] No orphan ontology nodes.
- [ ] No duplicated concepts.
- [ ] Consistent terminology across artifacts.
- [ ] All templates followed.
- [ ] Version numbers bumped where applicable.

---

## 8. AI Boundaries

### 8.1 Allowed (Autonomous)

- Generate code from specifications
- Generate documentation from knowledge
- Run tests and report results
- Update knowledge graph with approved changes
- Suggest refactoring
- Generate migration scripts

### 8.2 Allowed (With Approval)

- Modify production database schema
- Change API contracts
- Update authentication flows
- Modify CI/CD pipelines
- Merge pull requests
- Deploy to production

### 8.3 Forbidden

- Deploy to production without human approval
- Modify constitutions without team approval
- Invent business rules
- Bypass quality gates
- Access production data directly
- Make financial decisions
- Override security policies

---

## 9. Prompt Versioning

- Prompts are versioned semantically (MAJOR.MINOR.PATCH).
- Breaking changes increment MAJOR.
- New capabilities increment MINOR.
- Bug fixes increment PATCH.
- Prompts are stored in `.ai/prompts/`.

---

## 10. Non-Negotiables

1. **AI never invents business rules.** Always reference the knowledge repository.
2. **AI never bypasses quality gates.** No exceptions.
3. **AI never deploys without human approval.** Ever.
4. **AI outputs are auditable.** Every generation is traceable.
5. **AI respects the constitution.** It is the supreme authority.

---

*This constitution is a living document. Changes require team approval and version bump.*
