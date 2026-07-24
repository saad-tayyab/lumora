# Security Engineering Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Security Team  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines security standards for the Lumora ERP system. All code must comply with these standards.

---

## 2. Authentication

### 2.1 Better Auth

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
});
```

### 2.2 Session Management

- Sessions expire after 7 days
- Sessions update every 24 hours
- Sessions are invalidated on logout
- Sessions are invalidated on password change

---

## 3. Authorization

### 3.1 Role-Based Access Control

```typescript
// Define roles
const roles = {
  admin: ['*'],
  manager: ['account:read', 'account:write', 'invoice:*'],
  accountant: ['account:read', 'invoice:read', 'invoice:write'],
  viewer: ['account:read', 'invoice:read'],
};

// Check permissions
function authorize(user: User, permission: string): boolean {
  const userRole = roles[user.role];
  return userRole.includes('*') || userRole.includes(permission);
}
```

### 3.2 Resource-Level Authorization

```typescript
// Always check resource ownership
async function getInvoice(id: string, user: User) {
  const invoice = await repo.findInvoiceById(id);
  if (!invoice) throw new NotFoundError('Invoice', id);
  
  // Check ownership or admin role
  if (invoice.userId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('Cannot access this invoice');
  }
  
  return invoice;
}
```

---

## 4. Input Validation

### 4.1 Zod Schemas

```typescript
import { z } from 'zod';

// Always validate at API boundary
const CreateInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().positive().max(10000),
    unitPrice: z.number().positive().max(1000000),
  })).min(1).max(100),
  dueDate: z.string().datetime(),
});
```

### 4.2 Sanitization

```typescript
// Sanitize user input
function sanitize(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

---

## 5. Data Protection

### 5.1 Passwords

- Never store plain text passwords
- Use bcrypt with salt rounds >= 12
- Never log passwords
- Never return passwords in API responses

### 5.2 Sensitive Data

- Never commit secrets to git
- Use environment variables for secrets
- Encrypt sensitive data at rest
- Use HTTPS for all communication

### 5.3 PII (Personally Identifiable Information)

- Log PII carefully
- Encrypt PII at rest
- Implement data retention policies
- Support right to deletion

---

## 6. OWASP Top 10

| Risk | Mitigation |
|------|-----------|
| Broken Access Control | RBAC + resource-level auth |
| Cryptographic Failures | Use bcrypt, HTTPS, encryption |
| Injection | Parameterized queries (Drizzle) |
| Insecure Design | Threat modeling |
| Security Misconfiguration | Environment variables |
| Vulnerable Components | Regular dependency updates |
| Auth Failures | Better Auth with MFA |
| Data Integrity | Input validation, checksums |
| Logging Failures | Comprehensive audit logging |
| SSRF | Input validation, allowlists |

---

## 7. Best Practices

1. **Always validate input** — At API boundary.
2. **Always use parameterized queries** — Drizzle enforces this.
3. **Always use HTTPS** — No exceptions.
4. **Always hash passwords** — Use bcrypt.
5. **Always log security events** — For audit.
6. **Never expose internal errors** — Map to user-friendly messages.
7. **Never store secrets in code** — Use environment variables.

---

## 8. Anti-patterns

| Anti-pattern | Correct Approach |
|-------------|-----------------|
| Storing plain text passwords | Use bcrypt |
| Skipping input validation | Validate all inputs |
| Using HTTP | Always use HTTPS |
| Exposing stack traces | Log internally, show generic errors |
| Hardcoding secrets | Use environment variables |
| Missing rate limiting | Add rate limiting to public endpoints |
| No audit logging | Log all security events |
