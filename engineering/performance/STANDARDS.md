# Performance Engineering Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Performance Team  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines performance standards for the Lumora ERP system.

---

## 2. Performance Budgets

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | > 3s |
| Largest Contentful Paint | < 2.5s | > 4s |
| Time to Interactive | < 3.5s | > 5s |
| Total Bundle Size | < 250KB gzipped | > 500KB |
| API Response Time (p95) | < 200ms | > 500ms |
| Database Query (p95) | < 50ms | > 200ms |
| Lighthouse Score | > 90 | < 70 |

---

## 3. Frontend Performance

### 3.1 Bundle Optimization

```typescript
// Use dynamic imports for code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Use tree shaking
import { format } from 'date-fns'; // Only import what you use
```

### 3.2 Image Optimization

```svelte
<!-- Always use optimized images -->
<img
  src="/images/hero.webp"
  alt="Hero image"
  loading="lazy"
  width="800"
  height="600"
/>
```

### 3.3 Caching

```typescript
// Cache API responses
const cache = new Map();

async function fetchWithCache(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) return cache.get(key);
  const data = await fetcher();
  cache.set(key, data);
  return data;
}
```

---

## 4. Backend Performance

### 4.1 Database Optimization

```typescript
// Always add indexes for frequently queried columns
export const accounts = pgTable('accounts', {
  // ...
}, (table) => [
  index('idx_accounts_code').on(table.code),
  index('idx_accounts_type').on(table.type),
]);
```

### 4.2 Query Optimization

```typescript
// Avoid N+1 queries
const invoices = await db.query.invoices.findMany({
  with: {
    items: true, // Eager load items
    customer: true, // Eager load customer
  },
});
```

### 4.3 Connection Pooling

```typescript
// Use connection pooling
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
```

---

## 5. Monitoring

### 5.1 Metrics to Track

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Response time | Application logs | > 500ms |
| Error rate | Application logs | > 1% |
| CPU usage | Infrastructure | > 80% |
| Memory usage | Infrastructure | > 80% |
| Database connections | Neon dashboard | > 80% |
| Queue length | Application logs | > 100 |

### 5.2 Profiling

```bash
# Profile Bun
bun --prof app.ts

# Analyze profile
bun --prof-process isolate-*.log
```

---

## 6. Best Practices

1. **Always measure before optimizing** — Don't guess.
2. **Always set performance budgets** — Catch regressions early.
3. **Always use lazy loading** — Load only what's needed.
4. **Always cache aggressively** — Reduce redundant work.
5. **Always index database queries** — Speed up reads.
6. **Never block the main thread** — Use workers for heavy tasks.
7. **Never skip performance testing** — Test under load.

---

## 7. Anti-patterns

| Anti-pattern | Correct Approach |
|-------------|-----------------|
| Premature optimization | Measure first |
| N+1 queries | Use joins or eager loading |
| Missing indexes | Add indexes |
| No caching | Cache aggressively |
| Blocking operations | Use async/await |
| Large bundle sizes | Code split and lazy load |
