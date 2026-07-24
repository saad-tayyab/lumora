---
id: ADR-005
title: Authentication - Better Auth
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Authentication - Better Auth

## Status

Accepted

## Context

Lumora ERP needs a self-hosted authentication system that supports email/password, OAuth2 providers, MFA, session management, and role-based access control. The system must integrate with Neon PostgreSQL and Encore.ts.

## Decision

Use Better Auth v1.6.25 for authentication.

### Configuration

```typescript
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});
```

### Session Management

- Sessions expire after 7 days
- Sessions refresh every 24 hours
- Sessions invalidated on logout and password change
- Session tokens stored in HTTP-only cookies

### Role-Based Access Control

```typescript
const roles = {
  admin: ['*'],
  manager: ['account:read', 'account:write', 'invoice:*'],
  accountant: ['account:read', 'invoice:read', 'invoice:write'],
  viewer: ['account:read', 'invoice:read'],
};
```

### Resource-Level Authorization

```typescript
async function getInvoice(id: string, user: User) {
  const invoice = await repo.findInvoiceById(id);
  if (!invoice) throw new NotFoundError('Invoice', id);
  if (invoice.tenantId !== user.tenantId) throw new ForbiddenError();
  return invoice;
}
```

## Consequences

### Positive

- Self-hosted — no third-party auth dependency
- Built-in support for email/password + OAuth2
- Session management with configurable expiry
- TypeScript-first with excellent type inference
- Works with any PostgreSQL database

### Negative

- Smaller community than NextAuth/Clerk
- Some OAuth providers may require manual configuration
- MFA support is newer and less battle-tested

### Risks

- Better Auth is relatively new — less production hardening
- OAuth provider compatibility may vary

## Alternatives Considered

### Clerk

**Pros:** Excellent DX, managed service, built-in MFA.

**Cons:** Vendor lock-in, pricing scales with users, not self-hosted.

### NextAuth.js (Auth.js)

**Pros:** Large ecosystem, many providers, well-known.

**Cons:** Tightly coupled to Next.js, less flexible for non-Next frameworks.

### Lucia Auth

**Pros:** Lightweight, framework-agnostic.

**Cons:** Less feature-complete, community-driven maintenance.

## Related ADRs

- ADR-001: Technology Stack
- ADR-003: Backend Framework
- ADR-010: Multi-Tenancy

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
