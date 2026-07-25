import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  testDb,
  TEST_TENANT_ID,
  cleanupTestData,
  randomCode,
} from '../../lib/integration-test-utils';
import {
  taxCodes,
  taxRates,
  taxAutoAssignmentRules,
} from '@lumora/database/schema';

vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class MockSQLDatabase {
    connectionString = process.env.DATABASE_URL;
  },
}));

vi.mock('encore.dev/api', () => ({}));

vi.mock('../../database', () => ({
  db: testDb,
}));

import { taxCodesRepo, taxRatesRepo, taxAutoAssignmentRulesRepo } from './repo';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OTHER_TENANT = '33333333-3333-4333-8333-333333333333';

const GL_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';

function makeTaxCode(
  overrides?: Partial<typeof taxCodes.$inferInsert>,
): typeof taxCodes.$inferInsert {
  return {
    tenantId: TEST_TENANT_ID,
    code: randomCode('TAX'),
    name: 'Test Tax Code',
    type: 'vat' as const,
    glAccountId: GL_ACCOUNT_ID,
    isClaimable: false,
    postingRule: 'output_liability' as const,
    isActive: true,
    description: null,
    ...overrides,
  };
}

function makeTaxRate(
  taxCodeId: string,
  overrides?: Partial<typeof taxRates.$inferInsert>,
): typeof taxRates.$inferInsert {
  return {
    tenantId: TEST_TENANT_ID,
    taxCodeId,
    rate: '0.1500',
    effectiveDate: '2026-01-01',
    expiryDate: null,
    description: null,
    isActive: true,
    ...overrides,
  };
}

function makeAutoAssignmentRule(
  taxCodeId: string,
  overrides?: Partial<typeof taxAutoAssignmentRules.$inferInsert>,
): typeof taxAutoAssignmentRules.$inferInsert {
  return {
    tenantId: TEST_TENANT_ID,
    taxCodeId,
    name: 'Test Rule',
    description: null,
    priority: 0,
    entityType: 'customer',
    entityCategoryId: null,
    customerGroupId: null,
    itemCategoryId: null,
    regionCode: null,
    isActive: true,
    ...overrides,
  };
}

async function cleanupTaxData() {
  try {
    await testDb
      .delete(taxAutoAssignmentRules)
      .where(eq(taxAutoAssignmentRules.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb
      .delete(taxRates)
      .where(eq(taxRates.tenantId, TEST_TENANT_ID));
  } catch {}
  await cleanupTestData();
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Tax Repositories - Integration Tests', () => {
  beforeAll(async () => {
    await cleanupTaxData();
  });

  afterAll(async () => {
    await cleanupTaxData();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // taxCodesRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('taxCodesRepo', () => {
    describe('create', () => {
      it('should create a tax code and return it with generated id', async () => {
        const data = makeTaxCode({ code: 'VAT-15', name: 'Standard VAT' });
        const created = await taxCodesRepo.create(data);

        expect(created).toBeDefined();
        expect(created.id).toBeDefined();
        expect(created.code).toBe('VAT-15');
        expect(created.name).toBe('Standard VAT');
        expect(created.type).toBe('vat');
        expect(created.glAccountId).toBe(GL_ACCOUNT_ID);
        expect(created.isClaimable).toBe(false);
        expect(created.postingRule).toBe('output_liability');
        expect(created.isActive).toBe(true);
        expect(created.tenantId).toBe(TEST_TENANT_ID);
        expect(created.createdAt).toBeInstanceOf(Date);
        expect(created.updatedAt).toBeInstanceOf(Date);
      });

      it('should create a tax code with claimable flag', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'GST-C', name: 'Claimable GST', isClaimable: true }),
        );
        expect(created.isClaimable).toBe(true);
      });

      it('should create a tax code with input_asset posting rule', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'EXC', name: 'Excise', type: 'excise', postingRule: 'input_asset' }),
        );
        expect(created.postingRule).toBe('input_asset');
        expect(created.type).toBe('excise');
      });
    });

    describe('findById', () => {
      it('should return a tax code by id', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'FIND-ID', name: 'Find By ID' }),
        );
        const found = await taxCodesRepo.findById(created.id, TEST_TENANT_ID);

        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
        expect(found!.code).toBe('FIND-ID');
        expect(found!.name).toBe('Find By ID');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await taxCodesRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'TENANT-ISO', name: 'Tenant Isolation' }),
        );
        const found = await taxCodesRepo.findById(created.id, OTHER_TENANT);
        expect(found).toBeUndefined();
      });

      it('should return undefined for soft-deleted tax code', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'DEL-FIND', name: 'Deleted Tax Code' }),
        );
        await taxCodesRepo.delete(created.id, TEST_TENANT_ID);
        const found = await taxCodesRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });
    });

    describe('findByCode', () => {
      it('should return a tax code by code', async () => {
        const data = makeTaxCode({ code: 'FIND-CODE', name: 'Find By Code' });
        await taxCodesRepo.create(data);
        const found = await taxCodesRepo.findByCode('FIND-CODE', TEST_TENANT_ID);

        expect(found).toBeDefined();
        expect(found!.code).toBe('FIND-CODE');
        expect(found!.name).toBe('Find By Code');
      });

      it('should return undefined for non-existent code', async () => {
        const found = await taxCodesRepo.findByCode('NO-SUCH-CODE', TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        await taxCodesRepo.create(
          makeTaxCode({ code: 'CODE-ISO', name: 'Code Tenant Isolation' }),
        );
        const found = await taxCodesRepo.findByCode('CODE-ISO', OTHER_TENANT);
        expect(found).toBeUndefined();
      });

      it('should return undefined for soft-deleted tax code by code', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'DEL-CODE', name: 'Del By Code' }),
        );
        await taxCodesRepo.delete(created.id, TEST_TENANT_ID);
        const found = await taxCodesRepo.findByCode('DEL-CODE', TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      beforeAll(async () => {
        await taxCodesRepo.create(
          makeTaxCode({ code: 'VAT-A', name: 'VAT A', type: 'vat', isActive: true }),
        );
        await taxCodesRepo.create(
          makeTaxCode({ code: 'VAT-B', name: 'VAT B', type: 'vat', isActive: false }),
        );
        await taxCodesRepo.create(
          makeTaxCode({ code: 'GST-A', name: 'GST A', type: 'gst', isActive: true }),
        );
        await taxCodesRepo.create(
          makeTaxCode({ code: 'WHT-A', name: 'Withholding', type: 'withholding', isActive: true }),
        );
      });

      it('should return tax codes with total count', async () => {
        const result = await taxCodesRepo.findMany(TEST_TENANT_ID);

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(4);
        expect(result.data.length).toBeLessThanOrEqual(50);
      });

      it('should filter by type vat', async () => {
        const result = await taxCodesRepo.findMany(TEST_TENANT_ID, { type: 'vat' });

        expect(result.data.length).toBeGreaterThanOrEqual(2);
        for (const tc of result.data) {
          expect(tc.type).toBe('vat');
        }
      });

      it('should filter by type gst', async () => {
        const result = await taxCodesRepo.findMany(TEST_TENANT_ID, { type: 'gst' });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        for (const tc of result.data) {
          expect(tc.type).toBe('gst');
        }
      });

      it('should filter by isActive true', async () => {
        const result = await taxCodesRepo.findMany(TEST_TENANT_ID, { isActive: true });

        expect(result.data.length).toBeGreaterThanOrEqual(3);
        for (const tc of result.data) {
          expect(tc.isActive).toBe(true);
        }
      });

      it('should filter by isActive false', async () => {
        const result = await taxCodesRepo.findMany(TEST_TENANT_ID, { isActive: false });

        const inactiveOnly = result.data.filter((tc) => tc.isActive === false);
        expect(inactiveOnly.length).toBeGreaterThanOrEqual(1);
      });

      it('should paginate with limit', async () => {
        const result = await taxCodesRepo.findMany(TEST_TENANT_ID, { limit: 2 });

        expect(result.data.length).toBeLessThanOrEqual(2);
        expect(result.total).toBeGreaterThanOrEqual(4);
      });

      it('should paginate with offset', async () => {
        const page1 = await taxCodesRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 0 });
        const page2 = await taxCodesRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 1 });

        expect(page1.data.length).toBe(1);
        expect(page2.data.length).toBe(1);
        expect(page1.data[0]!.id).not.toBe(page2.data[0]!.id);
        expect(page1.total).toBe(page2.total);
      });

      it('should exclude soft-deleted tax codes', async () => {
        const toDelete = await taxCodesRepo.create(
          makeTaxCode({ code: 'DEL-FM', name: 'To Delete FindMany' }),
        );
        await taxCodesRepo.delete(toDelete.id, TEST_TENANT_ID);

        const result = await taxCodesRepo.findMany(TEST_TENANT_ID);
        const found = result.data.find((tc) => tc.id === toDelete.id);
        expect(found).toBeUndefined();
      });
    });

    describe('update', () => {
      it('should update tax code fields', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'UPD-1', name: 'Original Name' }),
        );
        const updated = await taxCodesRepo.update(created.id, TEST_TENANT_ID, {
          name: 'Updated Name',
        });

        expect(updated.name).toBe('Updated Name');
        expect(updated.id).toBe(created.id);
        expect(updated.code).toBe(created.code);
      });

      it('should update the updatedAt timestamp', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'UPD-TS', name: 'Timestamp Test' }),
        );
        await new Promise((r) => setTimeout(r, 10));
        const updated = await taxCodesRepo.update(created.id, TEST_TENANT_ID, {
          name: 'Timestamp Updated',
        });

        expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
          created.updatedAt.getTime(),
        );
      });

      it('should update the isActive flag', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'UPD-ACT', name: 'Active Test', isActive: true }),
        );
        const updated = await taxCodesRepo.update(created.id, TEST_TENANT_ID, {
          isActive: false,
        });

        expect(updated.isActive).toBe(false);
      });
    });

    describe('delete', () => {
      it('should soft-delete a tax code (set deletedAt)', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'DEL-1', name: 'Soft Delete' }),
        );
        await taxCodesRepo.delete(created.id, TEST_TENANT_ID);

        const found = await taxCodesRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });

      it('should not hard-delete the record from the database', async () => {
        const created = await taxCodesRepo.create(
          makeTaxCode({ code: 'DEL-2', name: 'Still In DB' }),
        );
        await taxCodesRepo.delete(created.id, TEST_TENANT_ID);

        const rows = await testDb
          .select()
          .from(taxCodes)
          .where(eq(taxCodes.id, created.id));
        expect(rows.length).toBe(1);
        expect(rows[0].deletedAt).not.toBeNull();
      });
    });

    describe('countRatesByTaxCodeId', () => {
      it('should count tax rates for a tax code', async () => {
        const taxCode = await taxCodesRepo.create(
          makeTaxCode({ code: 'CR-1', name: 'Count Rates' }),
        );
        await taxRatesRepo.create(
          makeTaxRate(taxCode.id, { rate: '0.1000', effectiveDate: '2026-01-01' }),
        );
        await taxRatesRepo.create(
          makeTaxRate(taxCode.id, { rate: '0.2000', effectiveDate: '2027-01-01' }),
        );

        const count = await taxCodesRepo.countRatesByTaxCodeId(taxCode.id, TEST_TENANT_ID);
        expect(count).toBeGreaterThanOrEqual(2);
      });

      it('should return 0 when no rates exist', async () => {
        const taxCode = await taxCodesRepo.create(
          makeTaxCode({ code: 'CR-0', name: 'Zero Rates' }),
        );
        const count = await taxCodesRepo.countRatesByTaxCodeId(taxCode.id, TEST_TENANT_ID);
        expect(count).toBe(0);
      });
    });

    describe('countAutoAssignmentRulesByTaxCodeId', () => {
      it('should count auto-assignment rules for a tax code', async () => {
        const taxCode = await taxCodesRepo.create(
          makeTaxCode({ code: 'CAR-1', name: 'Count Rules' }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(taxCode.id, { name: 'Rule 1', priority: 1 }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(taxCode.id, { name: 'Rule 2', priority: 2 }),
        );

        const count = await taxCodesRepo.countAutoAssignmentRulesByTaxCodeId(
          taxCode.id,
          TEST_TENANT_ID,
        );
        expect(count).toBeGreaterThanOrEqual(2);
      });

      it('should return 0 when no rules exist', async () => {
        const taxCode = await taxCodesRepo.create(
          makeTaxCode({ code: 'CAR-0', name: 'Zero Rules' }),
        );
        const count = await taxCodesRepo.countAutoAssignmentRulesByTaxCodeId(
          taxCode.id,
          TEST_TENANT_ID,
        );
        expect(count).toBe(0);
      });

      it('should exclude soft-deleted auto-assignment rules', async () => {
        const taxCode = await taxCodesRepo.create(
          makeTaxCode({ code: 'CAR-D', name: 'Deleted Rules' }),
        );
        const rule = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(taxCode.id, { name: 'Del Rule', priority: 10 }),
        );
        await taxAutoAssignmentRulesRepo.delete(rule.id, TEST_TENANT_ID);

        const count = await taxCodesRepo.countAutoAssignmentRulesByTaxCodeId(
          taxCode.id,
          TEST_TENANT_ID,
        );
        expect(count).toBe(0);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // taxRatesRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('taxRatesRepo', () => {
    let sharedTaxCodeId: string;

    beforeAll(async () => {
      const tc = await taxCodesRepo.create(
        makeTaxCode({ code: 'SHARED-TAX', name: 'Shared Tax Code' }),
      );
      sharedTaxCodeId = tc.id;
    });

    describe('create', () => {
      it('should create a tax rate and return it with generated id', async () => {
        const data = makeTaxRate(sharedTaxCodeId, {
          rate: '0.1500',
          effectiveDate: '2026-06-01',
          description: 'Standard rate',
        });
        const created = await taxRatesRepo.create(data);

        expect(created).toBeDefined();
        expect(created.id).toBeDefined();
        expect(created.taxCodeId).toBe(sharedTaxCodeId);
        expect(created.rate).toBe('0.1500');
        expect(created.effectiveDate).toBe('2026-06-01');
        expect(created.description).toBe('Standard rate');
        expect(created.isActive).toBe(true);
        expect(created.tenantId).toBe(TEST_TENANT_ID);
        expect(created.createdAt).toBeInstanceOf(Date);
      });

      it('should create a tax rate with an expiry date', async () => {
        const created = await taxRatesRepo.create(
          makeTaxRate(sharedTaxCodeId, {
            rate: '0.1000',
            effectiveDate: '2025-01-01',
            expiryDate: '2025-12-31',
          }),
        );
        expect(created.expiryDate).toBe('2025-12-31');
      });

      it('should create an inactive tax rate', async () => {
        const created = await taxRatesRepo.create(
          makeTaxRate(sharedTaxCodeId, {
            rate: '0.0500',
            effectiveDate: '2024-01-01',
            isActive: false,
          }),
        );
        expect(created.isActive).toBe(false);
      });
    });

    describe('findById', () => {
      it('should return a tax rate by id', async () => {
        const created = await taxRatesRepo.create(
          makeTaxRate(sharedTaxCodeId, {
            rate: '0.2000',
            effectiveDate: '2026-03-01',
          }),
        );
        const found = await taxRatesRepo.findById(created.id, TEST_TENANT_ID);

        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
        expect(found!.rate).toBe('0.2000');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await taxRatesRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await taxRatesRepo.create(
          makeTaxRate(sharedTaxCodeId, {
            rate: '0.1200',
            effectiveDate: '2026-04-01',
          }),
        );
        const found = await taxRatesRepo.findById(created.id, OTHER_TENANT);
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      let filterTaxCodeId: string;

      beforeAll(async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'FILTER-TAX', name: 'Filter Tax Code' }),
        );
        filterTaxCodeId = tc.id;
        await taxRatesRepo.create(
          makeTaxRate(filterTaxCodeId, { rate: '0.1000', effectiveDate: '2026-01-01', isActive: true }),
        );
        await taxRatesRepo.create(
          makeTaxRate(filterTaxCodeId, { rate: '0.2000', effectiveDate: '2027-01-01', isActive: false }),
        );
      });

      it('should return tax rates with total count', async () => {
        const result = await taxRatesRepo.findMany(TEST_TENANT_ID, {
          taxCodeId: filterTaxCodeId,
        });

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(2);
      });

      it('should filter by isActive', async () => {
        const result = await taxRatesRepo.findMany(TEST_TENANT_ID, {
          taxCodeId: filterTaxCodeId,
          isActive: true,
        });

        for (const tr of result.data) {
          expect(tr.isActive).toBe(true);
        }
      });

      it('should paginate with limit', async () => {
        const result = await taxRatesRepo.findMany(TEST_TENANT_ID, {
          taxCodeId: filterTaxCodeId,
          limit: 1,
        });

        expect(result.data.length).toBeLessThanOrEqual(1);
        expect(result.total).toBeGreaterThanOrEqual(2);
      });

      it('should paginate with offset', async () => {
        const page1 = await taxRatesRepo.findMany(TEST_TENANT_ID, {
          taxCodeId: filterTaxCodeId,
          limit: 1,
          offset: 0,
        });
        const page2 = await taxRatesRepo.findMany(TEST_TENANT_ID, {
          taxCodeId: filterTaxCodeId,
          limit: 1,
          offset: 1,
        });

        expect(page1.data.length).toBe(1);
        expect(page2.data.length).toBe(1);
        expect(page1.data[0]!.id).not.toBe(page2.data[0]!.id);
        expect(page1.total).toBe(page2.total);
      });
    });

    describe('findActiveRateForDate', () => {
      let activeRateTaxCodeId: string;

      beforeAll(async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'ACTIVE-DT', name: 'Active Date Tax Code' }),
        );
        activeRateTaxCodeId = tc.id;

        // Rate effective 2026-01-01 to 2026-12-31
        await taxRatesRepo.create(
          makeTaxRate(activeRateTaxCodeId, {
            rate: '0.1000',
            effectiveDate: '2026-01-01',
            expiryDate: '2026-12-31',
            isActive: true,
          }),
        );

        // Rate effective 2027-01-01 onward (no expiry)
        await taxRatesRepo.create(
          makeTaxRate(activeRateTaxCodeId, {
            rate: '0.1500',
            effectiveDate: '2027-01-01',
            expiryDate: null,
            isActive: true,
          }),
        );
      });

      it('should find the active rate for a date within effective range', async () => {
        const found = await taxRatesRepo.findActiveRateForDate(
          activeRateTaxCodeId,
          '2026-06-15',
          TEST_TENANT_ID,
        );
        expect(found).toBeDefined();
        expect(found!.rate).toBe('0.1000');
      });

      it('should find the rate on its effective date', async () => {
        const found = await taxRatesRepo.findActiveRateForDate(
          activeRateTaxCodeId,
          '2026-01-01',
          TEST_TENANT_ID,
        );
        expect(found).toBeDefined();
        expect(found!.rate).toBe('0.1000');
      });

      it('should find the rate on its expiry date (>= check)', async () => {
        const found = await taxRatesRepo.findActiveRateForDate(
          activeRateTaxCodeId,
          '2026-12-31',
          TEST_TENANT_ID,
        );
        expect(found).toBeDefined();
        expect(found!.rate).toBe('0.1000');
      });

      it('should return undefined when the only rate is expired', async () => {
        // Query a date range where no rate exists
        const found = await taxRatesRepo.findActiveRateForDate(
          activeRateTaxCodeId,
          '2026-12-32',
          TEST_TENANT_ID,
        );
        // After expiry of first rate and before effective of second
        expect(found).toBeUndefined();
      });

      it('should find the no-expiry rate for a future date', async () => {
        const found = await taxRatesRepo.findActiveRateForDate(
          activeRateTaxCodeId,
          '2027-06-15',
          TEST_TENANT_ID,
        );
        expect(found).toBeDefined();
        expect(found!.rate).toBe('0.1500');
      });

      it('should not find inactive rates', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'INACT-RATE', name: 'Inactive Rate Tax Code' }),
        );
        await taxRatesRepo.create(
          makeTaxRate(tc.id, {
            rate: '0.2500',
            effectiveDate: '2026-01-01',
            isActive: false,
          }),
        );

        const found = await taxRatesRepo.findActiveRateForDate(
          tc.id,
          '2026-06-15',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });
    });

    describe('update', () => {
      it('should update tax rate fields', async () => {
        const created = await taxRatesRepo.create(
          makeTaxRate(sharedTaxCodeId, {
            rate: '0.1000',
            effectiveDate: '2026-02-01',
          }),
        );
        const updated = await taxRatesRepo.update(created.id, TEST_TENANT_ID, {
          rate: '0.1200',
        });

        expect(updated.rate).toBe('0.1200');
        expect(updated.id).toBe(created.id);
      });

      it('should update the updatedAt timestamp', async () => {
        const created = await taxRatesRepo.create(
          makeTaxRate(sharedTaxCodeId, {
            rate: '0.1000',
            effectiveDate: '2026-05-01',
          }),
        );
        await new Promise((r) => setTimeout(r, 10));
        const updated = await taxRatesRepo.update(created.id, TEST_TENANT_ID, {
          description: 'Timestamp check',
        });

        expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
          created.updatedAt.getTime(),
        );
      });

      it('should update isActive flag on tax rate', async () => {
        const created = await taxRatesRepo.create(
          makeTaxRate(sharedTaxCodeId, {
            rate: '0.1000',
            effectiveDate: '2026-07-01',
            isActive: true,
          }),
        );
        const updated = await taxRatesRepo.update(created.id, TEST_TENANT_ID, {
          isActive: false,
        });

        expect(updated.isActive).toBe(false);
      });
    });

    describe('delete', () => {
      it('should hard-delete a tax rate', async () => {
        const created = await taxRatesRepo.create(
          makeTaxRate(sharedTaxCodeId, {
            rate: '0.1000',
            effectiveDate: '2026-08-01',
          }),
        );
        await taxRatesRepo.delete(created.id, TEST_TENANT_ID);

        const found = await taxRatesRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });

      it('should actually remove the record from the database', async () => {
        const created = await taxRatesRepo.create(
          makeTaxRate(sharedTaxCodeId, {
            rate: '0.1000',
            effectiveDate: '2026-09-01',
          }),
        );
        await taxRatesRepo.delete(created.id, TEST_TENANT_ID);

        const rows = await testDb
          .select()
          .from(taxRates)
          .where(eq(taxRates.id, created.id));
        expect(rows.length).toBe(0);
      });
    });

    describe('hasOverlap', () => {
      it('should detect overlapping effective dates for same tax code', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'OVL-1', name: 'Overlap Test 1' }),
        );
        await taxRatesRepo.create(
          makeTaxRate(tc.id, { rate: '0.1000', effectiveDate: '2026-01-15' }),
        );

        const overlap = await taxRatesRepo.hasOverlap(
          tc.id,
          '2026-01-15',
          TEST_TENANT_ID,
        );
        expect(overlap).toBe(true);
      });

      it('should return false for non-overlapping dates', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'OVL-2', name: 'Overlap Test 2' }),
        );
        await taxRatesRepo.create(
          makeTaxRate(tc.id, { rate: '0.1000', effectiveDate: '2026-01-01' }),
        );

        const overlap = await taxRatesRepo.hasOverlap(
          tc.id,
          '2026-06-01',
          TEST_TENANT_ID,
        );
        expect(overlap).toBe(false);
      });

      it('should exclude a specific id when checking overlap', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'OVL-3', name: 'Overlap Test 3' }),
        );
        const existing = await taxRatesRepo.create(
          makeTaxRate(tc.id, { rate: '0.1000', effectiveDate: '2026-03-01' }),
        );

        const overlap = await taxRatesRepo.hasOverlap(
          tc.id,
          '2026-03-01',
          TEST_TENANT_ID,
          existing.id,
        );
        expect(overlap).toBe(false);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // taxAutoAssignmentRulesRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('taxAutoAssignmentRulesRepo', () => {
    let sharedTaxCodeId: string;

    beforeAll(async () => {
      const tc = await taxCodesRepo.create(
        makeTaxCode({ code: 'AUTO-TAX', name: 'Auto Assignment Tax Code' }),
      );
      sharedTaxCodeId = tc.id;
    });

    describe('create', () => {
      it('should create an auto-assignment rule and return it', async () => {
        const data = makeAutoAssignmentRule(sharedTaxCodeId, {
          name: 'Customer VAT Rule',
          entityType: 'customer',
          priority: 10,
          regionCode: 'US-CA',
        });
        const created = await taxAutoAssignmentRulesRepo.create(data);

        expect(created).toBeDefined();
        expect(created.id).toBeDefined();
        expect(created.name).toBe('Customer VAT Rule');
        expect(created.entityType).toBe('customer');
        expect(created.priority).toBe(10);
        expect(created.regionCode).toBe('US-CA');
        expect(created.taxCodeId).toBe(sharedTaxCodeId);
        expect(created.isActive).toBe(true);
        expect(created.tenantId).toBe(TEST_TENANT_ID);
        expect(created.createdAt).toBeInstanceOf(Date);
      });

      it('should create a rule with category and group filters', async () => {
        const created = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, {
            name: 'Item Category Rule',
            entityType: 'item',
            entityCategoryId: '00000000-0000-0000-0000-000000000002',
            itemCategoryId: '00000000-0000-0000-0000-000000000003',
          }),
        );
        expect(created.entityCategoryId).toBe('00000000-0000-0000-0000-000000000002');
        expect(created.itemCategoryId).toBe('00000000-0000-0000-0000-000000000003');
      });

      it('should create an inactive rule', async () => {
        const created = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, {
            name: 'Inactive Rule',
            isActive: false,
          }),
        );
        expect(created.isActive).toBe(false);
      });
    });

    describe('findById', () => {
      it('should return a rule by id', async () => {
        const created = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, { name: 'FindById Rule' }),
        );
        const found = await taxAutoAssignmentRulesRepo.findById(
          created.id,
          TEST_TENANT_ID,
        );

        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
        expect(found!.name).toBe('FindById Rule');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await taxAutoAssignmentRulesRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, { name: 'Tenant Isolation Rule' }),
        );
        const found = await taxAutoAssignmentRulesRepo.findById(created.id, OTHER_TENANT);
        expect(found).toBeUndefined();
      });

      it('should return undefined for soft-deleted rule', async () => {
        const created = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, { name: 'Deleted Rule' }),
        );
        await taxAutoAssignmentRulesRepo.delete(created.id, TEST_TENANT_ID);
        const found = await taxAutoAssignmentRulesRepo.findById(
          created.id,
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      beforeAll(async () => {
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, {
            name: 'Active Rule 1',
            priority: 1,
            isActive: true,
          }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, {
            name: 'Active Rule 2',
            priority: 2,
            isActive: true,
          }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, {
            name: 'Inactive Rule',
            priority: 3,
            isActive: false,
          }),
        );
      });

      it('should return rules with total count', async () => {
        const result = await taxAutoAssignmentRulesRepo.findMany(TEST_TENANT_ID);

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(3);
      });

      it('should filter by isActive true', async () => {
        const result = await taxAutoAssignmentRulesRepo.findMany(TEST_TENANT_ID, {
          isActive: true,
        });

        for (const rule of result.data) {
          expect(rule.isActive).toBe(true);
        }
      });

      it('should filter by isActive false', async () => {
        const result = await taxAutoAssignmentRulesRepo.findMany(TEST_TENANT_ID, {
          isActive: false,
        });

        const inactiveOnly = result.data.filter((r) => r.isActive === false);
        expect(inactiveOnly.length).toBeGreaterThanOrEqual(1);
      });

      it('should paginate with limit', async () => {
        const result = await taxAutoAssignmentRulesRepo.findMany(TEST_TENANT_ID, {
          limit: 2,
        });

        expect(result.data.length).toBeLessThanOrEqual(2);
        expect(result.total).toBeGreaterThanOrEqual(3);
      });

      it('should paginate with offset', async () => {
        const page1 = await taxAutoAssignmentRulesRepo.findMany(TEST_TENANT_ID, {
          limit: 1,
          offset: 0,
        });
        const page2 = await taxAutoAssignmentRulesRepo.findMany(TEST_TENANT_ID, {
          limit: 1,
          offset: 1,
        });

        expect(page1.data.length).toBe(1);
        expect(page2.data.length).toBe(1);
        expect(page1.data[0]!.id).not.toBe(page2.data[0]!.id);
        expect(page1.total).toBe(page2.total);
      });

      it('should exclude soft-deleted rules', async () => {
        const toDelete = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, { name: 'To Delete', priority: 99 }),
        );
        await taxAutoAssignmentRulesRepo.delete(toDelete.id, TEST_TENANT_ID);

        const result = await taxAutoAssignmentRulesRepo.findMany(TEST_TENANT_ID);
        const found = result.data.find((r) => r.id === toDelete.id);
        expect(found).toBeUndefined();
      });
    });

    describe('findMatchingRules', () => {
      it('should find rules matching entity type', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'MATCH-1', name: 'Match Test 1' }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'Customer Match',
            entityType: 'customer',
            priority: 1,
            isActive: true,
          }),
        );

        const rules = await taxAutoAssignmentRulesRepo.findMatchingRules(TEST_TENANT_ID, {
          entityType: 'customer',
        });

        expect(rules.length).toBeGreaterThanOrEqual(1);
        for (const r of rules) {
          expect(r.entityType).toBe('customer');
          expect(r.isActive).toBe(true);
        }
      });

      it('should return empty for unmatched entity type', async () => {
        const rules = await taxAutoAssignmentRulesRepo.findMatchingRules(TEST_TENANT_ID, {
          entityType: 'nonexistent_type_xyz',
        });
        expect(rules.length).toBe(0);
      });

      it('should filter by regionCode', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'MATCH-2', name: 'Match Test 2' }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'Region Rule',
            entityType: 'customer',
            regionCode: 'PK',
            priority: 5,
            isActive: true,
          }),
        );

        const rules = await taxAutoAssignmentRulesRepo.findMatchingRules(TEST_TENANT_ID, {
          entityType: 'customer',
          regionCode: 'PK',
        });

        for (const r of rules) {
          expect(r.regionCode).toBe('PK');
        }
      });

      it('should filter by customerGroupId', async () => {
        const groupId = '00000000-0000-0000-0000-000000000010';
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'MATCH-3', name: 'Match Test 3' }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'Group Rule',
            entityType: 'customer',
            customerGroupId: groupId,
            priority: 7,
            isActive: true,
          }),
        );

        const rules = await taxAutoAssignmentRulesRepo.findMatchingRules(TEST_TENANT_ID, {
          entityType: 'customer',
          customerGroupId: groupId,
        });

        for (const r of rules) {
          expect(r.customerGroupId).toBe(groupId);
        }
      });

      it('should filter by itemCategoryId', async () => {
        const catId = '00000000-0000-0000-0000-000000000020';
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'MATCH-4', name: 'Match Test 4' }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'Item Cat Rule',
            entityType: 'item',
            itemCategoryId: catId,
            priority: 3,
            isActive: true,
          }),
        );

        const rules = await taxAutoAssignmentRulesRepo.findMatchingRules(TEST_TENANT_ID, {
          entityType: 'item',
          itemCategoryId: catId,
        });

        for (const r of rules) {
          expect(r.itemCategoryId).toBe(catId);
        }
      });

      it('should exclude soft-deleted rules from matching', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'MATCH-5', name: 'Match Test 5' }),
        );
        const rule = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'Deleted Match Rule',
            entityType: 'vendor',
            priority: 1,
            isActive: true,
          }),
        );
        await taxAutoAssignmentRulesRepo.delete(rule.id, TEST_TENANT_ID);

        const rules = await taxAutoAssignmentRulesRepo.findMatchingRules(TEST_TENANT_ID, {
          entityType: 'vendor',
        });
        const found = rules.find((r) => r.id === rule.id);
        expect(found).toBeUndefined();
      });

      it('should exclude inactive rules from matching', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'MATCH-6', name: 'Match Test 6' }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'Inactive Match Rule',
            entityType: 'invoice',
            priority: 1,
            isActive: false,
          }),
        );

        const rules = await taxAutoAssignmentRulesRepo.findMatchingRules(TEST_TENANT_ID, {
          entityType: 'invoice',
        });
        expect(rules.length).toBe(0);
      });

      it('should return rules ordered by priority ascending', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'MATCH-7', name: 'Match Test 7' }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'High Priority',
            entityType: 'order',
            priority: 50,
            isActive: true,
          }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'Low Priority',
            entityType: 'order',
            priority: 1,
            isActive: true,
          }),
        );

        const rules = await taxAutoAssignmentRulesRepo.findMatchingRules(TEST_TENANT_ID, {
          entityType: 'order',
        });

        expect(rules.length).toBeGreaterThanOrEqual(2);
        expect(rules[0]!.priority).toBeLessThanOrEqual(rules[rules.length - 1]!.priority);
      });
    });

    describe('hasPriorityConflict', () => {
      it('should detect priority conflict', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'PRIO-1', name: 'Priority Test 1' }),
        );
        await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'Existing Rule',
            priority: 42,
            isActive: true,
          }),
        );

        const conflict = await taxAutoAssignmentRulesRepo.hasPriorityConflict(
          42,
          TEST_TENANT_ID,
        );
        expect(conflict).toBe(true);
      });

      it('should return false when no conflict exists', async () => {
        const conflict = await taxAutoAssignmentRulesRepo.hasPriorityConflict(
          99999,
          TEST_TENANT_ID,
        );
        expect(conflict).toBe(false);
      });

      it('should exclude a specific id when checking conflict', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'PRIO-2', name: 'Priority Test 2' }),
        );
        const existing = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'Exclude Me',
            priority: 55,
            isActive: true,
          }),
        );

        const conflict = await taxAutoAssignmentRulesRepo.hasPriorityConflict(
          55,
          TEST_TENANT_ID,
          existing.id,
        );
        expect(conflict).toBe(false);
      });

      it('should not count soft-deleted rules as conflicts', async () => {
        const tc = await taxCodesRepo.create(
          makeTaxCode({ code: 'PRIO-3', name: 'Priority Test 3' }),
        );
        const rule = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(tc.id, {
            name: 'Deleted Priority',
            priority: 77,
            isActive: true,
          }),
        );
        await taxAutoAssignmentRulesRepo.delete(rule.id, TEST_TENANT_ID);

        const conflict = await taxAutoAssignmentRulesRepo.hasPriorityConflict(
          77,
          TEST_TENANT_ID,
        );
        expect(conflict).toBe(false);
      });
    });

    describe('update', () => {
      it('should update auto-assignment rule fields', async () => {
        const created = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, {
            name: 'Original Rule',
            priority: 1,
          }),
        );
        const updated = await taxAutoAssignmentRulesRepo.update(
          created.id,
          TEST_TENANT_ID,
          { name: 'Updated Rule', priority: 10 },
        );

        expect(updated.name).toBe('Updated Rule');
        expect(updated.priority).toBe(10);
        expect(updated.id).toBe(created.id);
      });

      it('should update the updatedAt timestamp', async () => {
        const created = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, {
            name: 'TS Rule',
            priority: 2,
          }),
        );
        await new Promise((r) => setTimeout(r, 10));
        const updated = await taxAutoAssignmentRulesRepo.update(
          created.id,
          TEST_TENANT_ID,
          { name: 'TS Updated Rule' },
        );

        expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
          created.updatedAt.getTime(),
        );
      });

      it('should update isActive flag', async () => {
        const created = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, {
            name: 'Active Rule',
            priority: 3,
            isActive: true,
          }),
        );
        const updated = await taxAutoAssignmentRulesRepo.update(
          created.id,
          TEST_TENANT_ID,
          { isActive: false },
        );

        expect(updated.isActive).toBe(false);
      });
    });

    describe('delete', () => {
      it('should soft-delete an auto-assignment rule', async () => {
        const created = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, {
            name: 'Delete Rule',
            priority: 4,
          }),
        );
        await taxAutoAssignmentRulesRepo.delete(created.id, TEST_TENANT_ID);

        const found = await taxAutoAssignmentRulesRepo.findById(
          created.id,
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should not hard-delete the record from the database', async () => {
        const created = await taxAutoAssignmentRulesRepo.create(
          makeAutoAssignmentRule(sharedTaxCodeId, {
            name: 'Still In DB Rule',
            priority: 5,
          }),
        );
        await taxAutoAssignmentRulesRepo.delete(created.id, TEST_TENANT_ID);

        const rows = await testDb
          .select()
          .from(taxAutoAssignmentRules)
          .where(eq(taxAutoAssignmentRules.id, created.id));
        expect(rows.length).toBe(1);
        expect(rows[0].deletedAt).not.toBeNull();
      });
    });
  });
});
