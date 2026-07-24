# Deployment Engineering Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** DevOps Team  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines deployment standards for the Lumora ERP system.

---

## 2. Deployment Stack

| Technology | Purpose |
|-----------|---------|
| Docker | Containerization |
| GitHub Actions | CI/CD |
| Docker Compose | Local development |

---

## 3. Docker

### 3.1 Dockerfile

```dockerfile
# Use Bun as base
FROM oven/bun:latest AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000
CMD ["bun", "start"]
```

### 3.2 Docker Compose

```yaml
version: '3.8'

services:
  web:
    build: ./apps/web
    ports:
      - '5173:5173'
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/lumora
    depends_on:
      - db

  backend:
    build: ./services/backend
    ports:
      - '4000:4000'
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/lumora
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_DB=lumora
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 4. CI/CD Pipeline

### 4.1 Stages

1. **Check** — Biome lint/format check
2. **Typecheck** — TypeScript type checking
3. **Test** — Unit and integration tests
4. **Build** — Build all packages
5. **Deploy** — Deploy to production

### 4.2 GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    needs: [check, typecheck, test, build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: echo "Deploying..."
```

---

## 5. Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Authentication secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key | Yes |
| `RESEND_API_KEY` | Resend API key | Yes |
| `R2_*` | Cloudflare R2 credentials | Yes |
| `APP_URL` | Application URL | Yes |
| `API_URL` | API URL | Yes |

---

## 6. Best Practices

1. **Always use production-ready base images** — Use specific versions.
2. **Always use multi-stage builds** — Reduce image size.
3. **Never store secrets in images** — Use environment variables.
4. **Always use health checks** — Monitor container health.
5. **Always use resource limits** — Prevent resource exhaustion.
6. **Always use rollback strategy** — Easy revert on failure.

---

## 7. Anti-patterns

| Anti-pattern | Correct Approach |
|-------------|-----------------|
| Using `latest` tag | Use specific version tags |
| Storing secrets in Dockerfile | Use environment variables |
| Running as root | Use non-root user |
| Large images | Use multi-stage builds |
| No health checks | Add health check endpoints |
| No rollback plan | Implement rollback strategy |
