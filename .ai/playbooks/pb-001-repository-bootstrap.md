# Repository Bootstrap Playbook

> **Playbook ID:** PB-001  
> **Version:** 1.0.0  
> **Owner:** AI Systems Engineer

---

## Purpose

Step-by-step guide for bootstrapping the Lumora ERP repository from scratch.

---

## Prerequisites

- Bun installed
- Node.js available
- Git initialized

## Steps

### Step 1: Initialize Project
```bash
bun init
```

### Step 2: Install Dependencies
```bash
bun add -d turbo @biomejs/biome
bun add -d husky lint-staged
```

### Step 3: Configure Monorepo
1. Create `turbo.json`
2. Create `biome.json`
3. Create root `tsconfig.json`
4. Create root `package.json` with workspaces

### Step 4: Create Directory Structure
```bash
mkdir -p apps/web services/backend packages/{ui,database,auth,shared,config,validation}
mkdir -p knowledge/{constitution,ontology,rules,workflows,graph,reports,glossary,templates,examples,references,manifests}
mkdir -p .ai/{agents,prompts,playbooks,commands,memory,contexts,checklists,system}
mkdir -p engineering/{frontend,backend,database,api,testing,deployment,security,architecture,performance,observability}
```

### Step 5: Create Constitutions
1. Create `knowledge/constitution/DOMAIN.md`
2. Create `knowledge/constitution/ENGINEERING.md`
3. Create `knowledge/constitution/AI.md`

### Step 6: Initialize Git
```bash
git init
git add .
git commit -m "chore: bootstrap repository"
```

## Validation
- [ ] All directories exist
- [ ] All config files are valid
- [ ] `bun install` succeeds
- [ ] `bunx @biomejs/biome check .` passes
