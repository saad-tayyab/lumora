# Testing Engineering Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** QA Team  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines testing standards for the Lumora ERP system. All tests must comply with these standards.

---

## 2. Testing Stack

| Tool | Purpose |
|------|---------|
| Vitest | Unit and integration tests |
| Playwright | End-to-end tests |
| Biome | Code quality checks |

---

## 3. Test Types

### 3.1 Unit Tests

```typescript
// accounts.test.ts
import { describe, it, expect } from 'vitest';
import { calculateAccountBalance } from './accounts.service';

describe('calculateAccountBalance', () => {
  it('should sum debits and credits correctly', () => {
    const lines = [
      { type: 'debit', amount: 100 },
      { type: 'credit', amount: 50 },
    ];
    
    const result = calculateAccountBalance(lines);
    
    expect(result).toBe(50);
  });
  
  it('should return zero for empty lines', () => {
    const result = calculateAccountBalance([]);
    expect(result).toBe(0);
  });
});
```

### 3.2 Integration Tests

```typescript
// invoice.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createInvoice } from './invoice.service';
import { db } from '@lumora/database';

describe('Invoice Service', () => {
  beforeEach(async () => {
    // Clean test data
    await db.delete(invoices);
  });
  
  it('should create invoice with items', async () => {
    const invoice = await createInvoice({
      customerId: 'test-customer',
      items: [{ itemId: 'test-item', quantity: 2, unitPrice: 50 }],
    });
    
    expect(invoice).toBeDefined();
    expect(invoice.total).toBe(100);
  });
});
```

### 3.3 E2E Tests

```typescript
// invoice.spec.ts
import { test, expect } from '@playwright/test';

test('should create and submit invoice', async ({ page }) => {
  await page.goto('/invoices/new');
  
  // Fill form
  await page.fill('[name="customer"]', 'Test Customer');
  await page.click('button:has-text("Add Item")');
  await page.fill('[name="quantity"]', '2');
  
  // Submit
  await page.click('button:has-text("Save")');
  
  // Verify
  await expect(page).toHaveURL(/\/invoices\//);
  await expect(page.locator('h1')).toContainText('Invoice');
});
```

---

## 4. Test Organization

### 4.1 File Structure

```
services/backend/src/
├── features/
│   ├── financial/
│   │   ├── accounts/
│   │   │   ├── accounts.service.ts
│   │   │   ├── accounts.service.test.ts      # Unit tests
│   │   │   ├── accounts.integration.test.ts  # Integration tests
│   │   │   └── __fixtures__/
│   │   │       └── accounts.fixture.ts       # Test fixtures
```

### 4.2 Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Unit test | `*.test.ts` | `accounts.service.test.ts` |
| Integration test | `*.integration.test.ts` | `accounts.integration.test.ts` |
| E2E test | `*.spec.ts` | `invoice.spec.ts` |
| Fixture | `*.fixture.ts` | `accounts.fixture.ts` |
| Mock | `*.mock.ts` | `api.mock.ts` |

---

## 5. Test Patterns

### 5.1 Arrange-Act-Assert

```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [
    { quantity: 2, unitPrice: 50 },
    { quantity: 1, unitPrice: 100 },
  ];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(200);
});
```

### 5.2 Given-When-Then

```typescript
it('should reject invoice with zero items', () => {
  // Given
  const invoiceData = { items: [] };
  
  // When
  const result = () => createInvoice(invoiceData);
  
  // Then
  expect(result).toThrow('At least one item required');
});
```

### 5.3 Mocking

```typescript
// Mock external dependencies
import { vi } from 'vitest';
import * as emailService from '../lib/email';

vi.mock('../lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'email-123' }),
}));

it('should send confirmation email', async () => {
  await createInvoice({ customerId: 'test' });
  
  expect(emailService.sendEmail).toHaveBeenCalledWith(
    expect.objectContaining({
      to: expect.any(String),
      subject: expect.stringContaining('Invoice'),
    })
  );
});
```

---

## 6. Coverage Requirements

| Type | Minimum | Target |
|------|---------|--------|
| Line coverage | 80% | 90% |
| Branch coverage | 75% | 85% |
| Function coverage | 80% | 90% |

---

## 7. Best Practices

1. **Test behavior, not implementation** — Test what it does, not how.
2. **One assertion per concept** — Keep tests focused.
3. **Use descriptive test names** — Explain what is being tested.
4. **Test edge cases** — Empty inputs, null values, boundaries.
5. **Test error paths** — What happens when things go wrong.
6. **Use fixtures** — Share test data.
7. **Clean up after tests** — Reset state between tests.

---

## 8. Anti-patterns

| Anti-pattern | Correct Approach |
|-------------|-----------------|
| Testing implementation details | Test behavior and outcomes |
| Too many assertions per test | One concept per test |
| Unclear test names | Use descriptive names |
| Skipping cleanup | Reset state between tests |
| Testing private methods | Test through public interface |
| Mocking everything | Mock only external dependencies |
