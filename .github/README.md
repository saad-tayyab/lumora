# GitHub Configuration

> **Status:** Active  
> **Version:** 1.0.0  
> **Owner:** DevOps Engineer

---

## Purpose

GitHub-specific configuration including CI/CD workflows, issue templates, and PR templates.

---

## Structure

| Directory | Purpose |
|-----------|---------|
| `workflows/` | GitHub Actions CI/CD pipelines |
| `ISSUE_TEMPLATE/` | Standardized issue templates |
| `PULL_REQUEST_TEMPLATE/` | PR description templates |

---

## CI/CD Pipelines

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push to main, PRs | Lint, typecheck, test |
| `deploy.yml` | Push to main | Deploy to production |
| `release.yml` | Tags | Create releases |

---

*GitHub configuration ensures consistent collaboration.*
