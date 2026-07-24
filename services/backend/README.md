# Backend Service

> **Status:** Active  
> **Version:** 0.0.1  
> **Stack:** Encore.ts + Drizzle ORM

---

## Purpose

The main API service for the Lumora ERP system. Built with Encore.ts, providing type-safe APIs and business logic.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Encore.ts | API framework |
| Bun | Runtime |
| Drizzle ORM | Database access |
| Neon PostgreSQL | Database |
| Better Auth | Authentication |
| Biome | Linting/formatting |
| Vitest | Unit tests |

---

## Structure

```
services/backend/src/
├── features/
│   ├── financial/
│   │   ├── accounts/
│   │   │   ├── accounts.api.ts
│   │   │   ├── accounts.service.ts
│   │   │   ├── accounts.repo.ts
│   │   │   ├── accounts.types.ts
│   │   │   └── accounts.test.ts
│   │   ├── journal-entries/
│   │   └── index.ts
│   ├── inventory/
│   ├── auth/
│   └── index.ts
├── lib/
│   ├── middleware/
│   ├── errors/
│   └── utils/
├── config/
│   └── database.ts
└── index.ts
```

---

## Development

```bash
# Start dev server
bun dev

# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Seed database
bun run db:seed

# Run tests
bun test
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /accounts | List accounts |
| GET | /accounts/:id | Get account |
| POST | /accounts | Create account |
| PUT | /accounts/:id | Update account |
| DELETE | /accounts/:id | Delete account |

---

## Key Features

- Type-safe API definitions
- Automatic OpenAPI documentation
- Built-in authentication
- Database migrations
- Error handling
