import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID, TEST_USER_ID, cleanupTestData } from '../../lib/integration-test-utils';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string; status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message); this.code = code; this.status = opts?.status ?? 500;
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class { connectionString = ''; constructor(_n: string, _c?: unknown) {} },
}));
vi.mock('../../database', () => ({ db: testDb }));

import * as service from './service';
import { taxCodes, taxRates, taxAutoAssignmentRules } from '@lumora/database/schema';
import { eq } from 'drizzle-orm';

const GL_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';

async function cleanupTaxData(): Promise<void> {
  try {
    await testDb.delete(taxAutoAssignmentRules).where(eq(taxAutoAssignmentRules.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(taxRates).where(eq(taxRates.tenantId, TEST_TENANT_ID));
  } catch {}
  await cleanupTestData();
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Tax Service - Integration Tests', () => {
  beforeAll(async () => {
    await cleanupTaxData();
  });

  afterAll(async () => {
    await cleanupTaxData();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Tax code lifecycle: create → get → update → list
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tax code lifecycle', () => {
    let taxCodeId: string;

    it('should create a tax code', async () => {
      const code = await service.createTaxCode(
        {
          code: 'VAT-15',
          name: 'Standard VAT',
          type: 'vat',
          glAccountId: GL_ACCOUNT_ID,
          isClaimable: false,
          postingRule: 'output_liability',
          isActive: true,
        },
        TEST_TENANT_ID,
      );

      expect(code.id).toBeDefined();
      expect(code.code).toBe('VAT-15');
      expect(code.name).toBe('Standard VAT');
      expect(code.type).toBe('vat');
      expect(code.glAccountId).toBe(GL_ACCOUNT_ID);
      expect(code.tenantId).toBe(TEST_TENANT_ID);

      taxCodeId = code.id;
    });

    it('should retrieve the created tax code by id', async () => {
      const found = await service.getTaxCode(taxCodeId, TEST_TENANT_ID);
      expect(found.id).toBe(taxCodeId);
      expect(found.code).toBe('VAT-15');
      expect(found.name).toBe('Standard VAT');
    });

    it('should update tax code fields', async () => {
      const updated = await service.updateTaxCode(
        taxCodeId,
        { name: 'Standard VAT (Updated)', isClaimable: true },
        TEST_TENANT_ID,
      );

      expect(updated.id).toBe(taxCodeId);
      expect(updated.name).toBe('Standard VAT (Updated)');
      expect(updated.isClaimable).toBe(true);

      const dbRow = await testDb.select().from(taxCodes).where(eq(taxCodes.id, taxCodeId));
      expect(dbRow[0].name).toBe('Standard VAT (Updated)');
      expect(dbRow[0].isClaimable).toBe(true);
    });

    it('should list tax codes with pagination', async () => {
      await service.createTaxCode(
        {
          code: 'GST-10',
          name: 'GST Standard',
          type: 'gst',
          glAccountId: GL_ACCOUNT_ID,
          isClaimable: false,
          postingRule: 'output_liability',
          isActive: true,
        },
        TEST_TENANT_ID,
      );

      const result = await service.listTaxCodes(TEST_TENANT_ID, { page: 1, limit: 10 });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);

      const codes = result.data.map((tc) => tc.code);
      expect(codes).toContain('VAT-15');
      expect(codes).toContain('GST-10');
    });

    it('should filter tax codes by type', async () => {
      const result = await service.listTaxCodes(TEST_TENANT_ID, {
        page: 1,
        limit: 10,
        type: 'vat',
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      for (const tc of result.data) {
        expect(tc.type).toBe('vat');
      }
    });

    it('should reject duplicate tax code within same tenant', async () => {
      await expect(
        service.createTaxCode(
          {
            code: 'VAT-15',
            name: 'Duplicate VAT',
            type: 'vat',
            glAccountId: GL_ACCOUNT_ID,
            isClaimable: false,
            postingRule: 'output_liability',
            isActive: true,
          },
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow('already exists');
    });

    it('should reject tax code without GL account', async () => {
      await expect(
        service.createTaxCode(
          {
            code: 'NO-GL',
            name: 'No GL Account',
            type: 'vat',
            glAccountId: '',
            isClaimable: false,
            postingRule: 'output_liability',
            isActive: true,
          },
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. Tax rate lifecycle: create code → create rate → get → list
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tax rate lifecycle', () => {
    let taxCodeId: string;
    let taxRateId: string;

    beforeAll(async () => {
      const code = await service.createTaxCode(
        {
          code: 'RATE-LC',
          name: 'Rate Lifecycle Tax',
          type: 'sales_tax',
          glAccountId: GL_ACCOUNT_ID,
          isClaimable: false,
          postingRule: 'output_liability',
          isActive: true,
        },
        TEST_TENANT_ID,
      );
      taxCodeId = code.id;
    });

    it('should create a tax rate on an active tax code', async () => {
      const rate = await service.createTaxRate(
        {
          taxCodeId,
          rate: '0.0750',
          effectiveDate: '2026-01-01',
          expiryDate: null,
          description: 'Standard sales tax',
          isActive: true,
        },
        TEST_TENANT_ID,
      );

      expect(rate.id).toBeDefined();
      expect(rate.taxCodeId).toBe(taxCodeId);
      expect(rate.rate).toBe('0.0750');
      expect(rate.effectiveDate).toBe('2026-01-01');
      expect(rate.isActive).toBe(true);

      taxRateId = rate.id;

      const dbRow = await testDb.select().from(taxRates).where(eq(taxRates.id, taxRateId));
      expect(dbRow.length).toBe(1);
      expect(dbRow[0].rate).toBe('0.0750');
    });

    it('should retrieve the created tax rate by id', async () => {
      const found = await service.getTaxRate(taxRateId, TEST_TENANT_ID);
      expect(found.id).toBe(taxRateId);
      expect(found.rate).toBe('0.0750');
      expect(found.taxCodeId).toBe(taxCodeId);
    });

    it('should list tax rates filtered by tax code', async () => {
      await service.createTaxRate(
        {
          taxCodeId,
          rate: '0.1000',
          effectiveDate: '2027-01-01',
          expiryDate: null,
          description: 'Future rate',
          isActive: true,
        },
        TEST_TENANT_ID,
      );

      const result = await service.listTaxRates(TEST_TENANT_ID, {
        page: 1,
        limit: 10,
        taxCodeId,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
      for (const tr of result.data) {
        expect(tr.taxCodeId).toBe(taxCodeId);
      }
    });

    it('should reject tax rate creation on inactive tax code', async () => {
      const inactiveCode = await service.createTaxCode(
        {
          code: 'INACT-RATE',
          name: 'Inactive Rate Test',
          type: 'vat',
          glAccountId: GL_ACCOUNT_ID,
          isClaimable: false,
          postingRule: 'output_liability',
          isActive: true,
        },
        TEST_TENANT_ID,
      );

      await service.updateTaxCode(inactiveCode.id, { isActive: false }, TEST_TENANT_ID);

      await expect(
        service.createTaxRate(
          {
            taxCodeId: inactiveCode.id,
            rate: '0.0500',
            effectiveDate: '2026-01-01',
            isActive: true,
          },
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow();
    });

    it('should reject overlapping effective date for same tax code', async () => {
      await expect(
        service.createTaxRate(
          {
            taxCodeId,
            rate: '0.0500',
            effectiveDate: '2026-01-01',
            isActive: true,
          },
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. Tax calculation: create code with rate → calculate tax → verify amount
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tax calculation', () => {
    let calcTaxCodeId: string;

    beforeAll(async () => {
      const code = await service.createTaxCode(
        {
          code: 'CALC-VAT',
          name: 'Calculation VAT',
          type: 'vat',
          glAccountId: GL_ACCOUNT_ID,
          isClaimable: false,
          postingRule: 'output_liability',
          isActive: true,
        },
        TEST_TENANT_ID,
      );
      calcTaxCodeId = code.id;

      await service.createTaxRate(
        {
          taxCodeId: calcTaxCodeId,
          rate: '0.1500',
          effectiveDate: '2026-01-01',
          expiryDate: '2026-12-31',
          isActive: true,
        },
        TEST_TENANT_ID,
      );
    });

    it('should calculate tax correctly for a given amount', async () => {
      const result = await service.calculateTax(calcTaxCodeId, '1000.00', '2026-06-15', TEST_TENANT_ID);

      expect(result.taxCodeId).toBe(calcTaxCodeId);
      expect(result.rate).toBe('0.1500');
      expect(result.taxableAmount).toBe('1000.00');
      expect(result.taxAmount).toBe('150.0000');
      expect(result.effectiveDate).toBe('2026-01-01');
      expect(result.expiryDate).toBe('2026-12-31');
    });

    it('should calculate tax with correct decimal precision', async () => {
      const result = await service.calculateTax(calcTaxCodeId, '333.33', '2026-06-15', TEST_TENANT_ID);

      expect(result.taxAmount).toBe('49.9995');
    });

    it('should return zero tax for zero taxable amount', async () => {
      const result = await service.calculateTax(calcTaxCodeId, '0.00', '2026-06-15', TEST_TENANT_ID);

      expect(result.taxAmount).toBe('0.0000');
      expect(result.taxableAmount).toBe('0.00');
    });

    it('should reject calculation for inactive tax code', async () => {
      const inactiveCode = await service.createTaxCode(
        {
          code: 'CALC-INACT',
          name: 'Inactive Calc',
          type: 'vat',
          glAccountId: GL_ACCOUNT_ID,
          isClaimable: false,
          postingRule: 'output_liability',
          isActive: true,
        },
        TEST_TENANT_ID,
      );

      await service.createTaxRate(
        {
          taxCodeId: inactiveCode.id,
          rate: '0.1000',
          effectiveDate: '2026-01-01',
          isActive: true,
        },
        TEST_TENANT_ID,
      );

      await service.updateTaxCode(inactiveCode.id, { isActive: false }, TEST_TENANT_ID);

      await expect(
        service.calculateTax(inactiveCode.id, '100.00', '2026-06-15', TEST_TENANT_ID),
      ).rejects.toThrow();
    });

    it('should reject calculation when no active rate exists for transaction date', async () => {
      const futureCode = await service.createTaxCode(
        {
          code: 'CALC-FUTURE',
          name: 'Future Rate Calc',
          type: 'vat',
          glAccountId: GL_ACCOUNT_ID,
          isClaimable: false,
          postingRule: 'output_liability',
          isActive: true,
        },
        TEST_TENANT_ID,
      );

      await service.createTaxRate(
        {
          taxCodeId: futureCode.id,
          rate: '0.2000',
          effectiveDate: '2028-01-01',
          isActive: true,
        },
        TEST_TENANT_ID,
      );

      await expect(
        service.calculateTax(futureCode.id, '100.00', '2026-06-15', TEST_TENANT_ID),
      ).rejects.toThrow();
    });
  });
});
