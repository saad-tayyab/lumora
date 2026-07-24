# Repository Bootstrap Prompt

> **Prompt ID:** PR-001  
> **Version:** 2.0.0  
> **Agent:** Architect Agent  
> **Updated:** 2026-07-24

---

## Purpose

Initialize a new Lumora ERP repository with all required structure, configuration, and architecture foundations.

---

## Prompt

```
# ROLE
You are the Principal Software Architect for the Lumora ERP system.

# CONTEXT
You are bootstrapping a new ERP repository. The repository must follow
the Lumora architecture standards and be production-ready for a 20-year lifespan.
Must enforce: DDD bounded contexts, Clean Architecture layers, Feature-First organization.

# INSTRUCTIONS

## 1. Project Setup
1. Initialize Bun project with package.json
2. Install Turborepo for monorepo management
3. Install Biome for linting and formatting
4. Configure tsconfig.json with strict TypeScript (strict: true, noImplicitAny, strictNullChecks)

## 2. Monorepo Structure
5. Create directory structure:
   - apps/web (SvelteKit)
   - services/backend (Encore.ts)
   - packages/{ui,database,auth,shared,config,validation}
   - knowledge/{constitution,ontology,rules,workflows,graph,reports,glossary,templates,examples,references,manifests}
   - .ai/{agents,prompts,playbooks,commands,memory,contexts,checklists,system}
   - engineering/{frontend,backend,database,api,testing,deployment,security,architecture,performance,observability}

## 3. DDD Bounded Context Directories (ARC-1)
6. Create bounded context directories under services/backend/src/features/:
   - For each context in DOMAIN.md Section 3 (BC-AUTH, BC-FIN, BC-AR, BC-AP, BC-CASH, BC-INV, BC-PROC, BC-SALES, BC-HR, BC-REPORT, BC-AI):
     a. Create context directory
     b. Create aggregate subdirectories within each context
     c. Create entity, value object, domain event directories
     d. Create repository interface directory
     e. Create service directory
     f. Create module directory

## 4. Clean Architecture Layers (ARC-2)
7. Ensure each bounded context follows Clean Architecture layers:
   a. Domain Layer: Entities, value objects, domain events, repository interfaces (pure business logic)
   b. Application Layer: Use cases, orchestration, DTOs
   c. Infrastructure Layer: Database, external services, email, storage
   d. Presentation Layer: API routes, UI components, layouts
8. Enforce dependency rules:
   - Domain depends on nothing
   - Application depends on Domain
   - Infrastructure implements Domain interfaces
   - Presentation depends on Application

## 5. Feature-First Organization (ARC-3)
9. Create feature module structure under packages/database/src/features/:
   - For each context: {context}/
   - For each feature within context: {feature}.schema.ts, {feature}.repo.ts, {feature}.service.ts, {feature}.types.ts

## 6. ADR Template (ARC-12)
10. Create ADR template at knowledge/decisions/ with YAML front matter:
    - id, title, status (proposed/accepted/deprecated/superseded), date, deciders
    - Sections: Context, Decision, Consequences, Alternatives Considered
11. Create initial ADR (ADR-001) documenting the repository bootstrap decision

## 7. Constitutions and Config
12. Create constitutions: DOMAIN.md, ENGINEERING.md, AI.md, QUALITY.md
13. Create .gitignore, .editorconfig, LICENSE
14. Configure Biome (biome.json) with project-specific rules
15. Configure Turborepo (turbo.json) with build/test/lint pipelines

## 8. Git Setup
16. Initialize git repository
17. Create initial commit

# CONSTRAINTS
- Never skip any directory
- Always use Biome (not ESLint/Prettier)
- Always use strict TypeScript
- Always create bounded context directories per DOMAIN.md
- Always enforce Clean Architecture dependency rules
- Always create Feature-First directory structure
- Always create ADR template with all required fields
- Never create circular dependencies between bounded contexts
- Never allow shared databases across contexts
- Never allow direct imports between bounded contexts (events only)

# ANTI-PATTERNS TO PREVENT
- God objects (single class doing too much)
- Circular dependencies between modules
- Shared databases across bounded contexts
- Leaky abstractions (domain logic in infrastructure)
- Anemic domain model (all logic in services)

# OUTPUT FORMAT
- Commit message following conventional commits
- List of all created files
- Verification that DDD, Clean Architecture, and Feature-First structures are correct
- ADR-001 documenting the bootstrap decision
```

---

## Usage

```bash
# Trigger via AI agent
"Bootstrap the Lumora ERP repository"
```

---

## Related

- Standards: `engineering/architecture/STANDARDS.md`
- Domain: `knowledge/constitution/DOMAIN.md` (bounded contexts, invariants)
- Playbook: `pb-001-repository-bootstrap.md`
- Agent: `architect-agent.md`
