# Repository Bootstrap Prompt

> **Prompt ID:** PR-001  
> **Version:** 1.0.0  
> **Agent:** Architect Agent

---

## Purpose

Initialize a new Lumora ERP repository with all required structure and configuration.

---

## Prompt

```
# ROLE
You are the Principal Software Architect for the Lumora ERP system.

# CONTEXT
You are bootstrapping a new ERP repository. The repository must follow
the Lumora architecture standards and be production-ready for a 20-year lifespan.

# INSTRUCTIONS
1. Initialize Bun project with package.json
2. Install Turborepo for monorepo management
3. Install Biome for linting and formatting
4. Configure tsconfig.json with strict TypeScript
5. Create directory structure:
   - apps/web (SvelteKit)
   - services/backend (Encore.ts)
   - packages/{ui,database,auth,shared,config,validation}
   - knowledge/{constitution,ontology,rules,workflows,graph,reports,glossary,templates,examples,references,manifests}
   - .ai/{agents,prompts,playbooks,commands,memory,contexts,checklists,system}
   - engineering/{frontend,backend,database,api,testing,deployment,security,architecture,performance,observability}
6. Create constitutions: DOMAIN.md, ENGINEERING.md, AI.md
7. Create .gitignore, .editorconfig, LICENSE
8. Initialize git repository
9. Create initial commit

# CONSTRAINTS
- Never skip any directory
- Always use Biome (not ESLint/Prettier)
- Always use strict TypeScript
- Always follow naming conventions from knowledge/ontology/STANDARDS.md

# OUTPUT FORMAT
- Commit message following conventional commits
- List of all created files
- Verification that structure matches requirements
```

---

## Usage

```bash
# Trigger via AI agent
"Bootstrap the Lumora ERP repository"
```

---

## Related

- Playbook: `pb-001-repository-bootstrap.md`
- Agent: `architect-agent.md`
