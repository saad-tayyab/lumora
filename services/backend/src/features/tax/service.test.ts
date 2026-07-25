import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID } from '../../lib/test-utils';
import {
  createAutoAssignmentRuleFixture,
  createAutoAssignmentRuleInputFixture,
  createInactiveTaxCodeFixture,
  createTaxCodeFixture,
  createTaxCodeInputFixture,
  createTaxRateFixture,
  createTaxRateInputFixture,
} from './fixtures/tax.fixture';

// ─── Mock encore.dev/api (required to avoid runtime env error) ────────────

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    constructor(_code: string, message: string, _details?: unknown) {
      super(message);
      this.name = 'APIError';
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));

// ─── Mock Database Module ─────────────────────────────────────────────────

const mockTx = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 'tax-code-00000000-0000-0000-000000000001' }]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }),
  delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  select: vi.fn().mockResolvedValue([{ count: 0 }]),
  query: {
    taxCodes: { findFirst: vi.fn(), findMany: vi.fn() },
    taxRates: { findFirst: vi.fn(), findMany: vi.fn() },
    taxAutoAssignmentRules: { findFirst: vi.fn(), findMany: vi.fn() },
  },
};

vi.mock('@lumora/database', () => ({
  db: {
    query: {},
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  },
}));

// ─── Mock Schema (used directly in service transactions) ──────────────────

const { createMockTable } = vi.hoisted(() => ({
  createMockTable: (name: string) => {
    const table = { _: { name, schema: undefined } } as Record<string, unknown>;
    return new Proxy(table, {
      get: (_target, prop) => {
        if (typeof prop === 'symbol') return undefined;
        return {
          _: { name: String(prop), schema: undefined },
          toString: () => `${name}.${String(prop)}`,
        };
      },
    });
  },
}));

vi.mock('@lumora/database/schema', () => ({
  taxCodes: createMockTable('tax_codes'),
  taxRates: createMockTable('tax_rates'),
  taxAutoAssignmentRules: createMockTable('tax_auto_assignment_rules'),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => true),
    and: vi.fn(() => true),
    isNull: vi.fn(() => true),
    asc: vi.fn(() => ({})),
    count: vi.fn(() => 0),
    sum: vi.fn(() => '0'),
    sql: vi.fn(() => ({})),
  };
});

// ─── Mock Repo Module ─────────────────────────────────────────────────────

const { mockTaxCodesRepo, mockTaxRatesRepo, mockTaxAutoAssignmentRulesRepo } = vi.hoisted(() => ({
  mockTaxCodesRepo: {
    findById: vi.fn(),
    findByCode: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countRatesByTaxCodeId: vi.fn(),
    countAutoAssignmentRulesByTaxCodeId: vi.fn(),
  },
  mockTaxRatesRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findActiveRateForDate: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    hasOverlap: vi.fn(),
  },
  mockTaxAutoAssignmentRulesRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findMatchingRules: vi.fn(),
    hasPriorityConflict: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('./repo', () => ({
  taxCodesRepo: mockTaxCodesRepo,
  taxRatesRepo: mockTaxRatesRepo,
  taxAutoAssignmentRulesRepo: mockTaxAutoAssignmentRulesRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  TaxAutoAssignmentRuleNotFoundError,
  TaxAutoAssignmentRulePriorityConflictError,
  TaxCodeAlreadyExistsError,
  TaxCodeGlAccountRequiredError,
  TaxCodeHasAutoAssignmentRulesError,
  TaxCodeHasRatesError,
  TaxCodeInactiveError,
  TaxCodeNotFoundError,
  TaxRateNotFoundError,
  TaxRateOverlapError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Tax Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TAX CODE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tax Code Service', () => {
    describe('createTaxCode', () => {
      it('should create tax code with unique code and GL account', async () => {
        const input = createTaxCodeInputFixture();
        const expected = createTaxCodeFixture();

        mockTaxCodesRepo.findByCode.mockResolvedValue(undefined);
        mockTaxCodesRepo.create.mockResolvedValue(expected);

        const result = await service.createTaxCode(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockTaxCodesRepo.findByCode).toHaveBeenCalledWith(input.code, TEST_TENANT_ID);
        expect(mockTaxCodesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID }),
        );
      });

      it('should create tax code with all types', async () => {
        for (const type of ['sales_tax', 'vat', 'gst', 'excise', 'withholding'] as const) {
          const input = createTaxCodeInputFixture({ code: `TX-${type.toUpperCase()}`, type });
          const expected = createTaxCodeFixture({ code: `TX-${type.toUpperCase()}`, type });

          mockTaxCodesRepo.findByCode.mockResolvedValue(undefined);
          mockTaxCodesRepo.create.mockResolvedValue(expected);

          const result = await service.createTaxCode(input, TEST_TENANT_ID);

          expect(result.type).toBe(type);
          vi.clearAllMocks();
        }
      });

      it('should reject duplicate tax code', async () => {
        const input = createTaxCodeInputFixture();
        const existing = createTaxCodeFixture();

        mockTaxCodesRepo.findByCode.mockResolvedValue(existing);

        await expect(service.createTaxCode(input, TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeAlreadyExistsError,
        );
      });

      it('should reject tax code without GL account (INV-TAX-003)', async () => {
        const input = createTaxCodeInputFixture({ glAccountId: undefined });

        await expect(service.createTaxCode(input, TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeGlAccountRequiredError,
        );
      });

      it('should scope code uniqueness to tenant', async () => {
        const input = createTaxCodeInputFixture({ code: 'VAT-STD' });
        const otherTenantCode = createTaxCodeFixture({ code: 'VAT-STD' });

        mockTaxCodesRepo.findByCode.mockImplementation(async (_code: string, tenantId: string) => {
          if (tenantId === OTHER_TENANT_ID) return otherTenantCode;
          return undefined;
        });
        mockTaxCodesRepo.create.mockResolvedValue(createTaxCodeFixture());

        const result = await service.createTaxCode(input, TEST_TENANT_ID);
        expect(result).toBeDefined();
        expect(mockTaxCodesRepo.findByCode).toHaveBeenCalledWith('VAT-STD', TEST_TENANT_ID);
      });
    });

    describe('getTaxCode', () => {
      it('should return tax code by id', async () => {
        const taxCode = createTaxCodeFixture();
        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);

        const result = await service.getTaxCode(taxCode.id, TEST_TENANT_ID);

        expect(result).toEqual(taxCode);
        expect(mockTaxCodesRepo.findById).toHaveBeenCalledWith(taxCode.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent tax code', async () => {
        mockTaxCodesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getTaxCode('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockTaxCodesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getTaxCode('tc-1', OTHER_TENANT_ID)).rejects.toThrow(
          TaxCodeNotFoundError,
        );
        expect(mockTaxCodesRepo.findById).toHaveBeenCalledWith('tc-1', OTHER_TENANT_ID);
      });
    });

    describe('listTaxCodes', () => {
      it('should return paginated tax codes', async () => {
        const codes = [createTaxCodeFixture()];
        mockTaxCodesRepo.findMany.mockResolvedValue({ data: codes, total: 1 });

        const result = await service.listTaxCodes(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no tax codes exist', async () => {
        mockTaxCodesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listTaxCodes(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockTaxCodesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listTaxCodes(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockTaxCodesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 20 }),
        );
      });

      it('should filter by type', async () => {
        mockTaxCodesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listTaxCodes(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          type: 'vat',
        });

        expect(mockTaxCodesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ type: 'vat' }),
        );
      });

      it('should filter by isActive', async () => {
        mockTaxCodesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listTaxCodes(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          isActive: false,
        });

        expect(mockTaxCodesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ isActive: false }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockTaxCodesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listTaxCodes(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockTaxCodesRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
      });
    });

    describe('updateTaxCode', () => {
      it('should update tax code name', async () => {
        const existing = createTaxCodeFixture();
        const updated = { ...existing, name: 'Updated VAT' };

        mockTaxCodesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.update.mockResolvedValue(updated);

        const result = await service.updateTaxCode(
          existing.id,
          { name: 'Updated VAT' },
          TEST_TENANT_ID,
        );

        expect(result.name).toBe('Updated VAT');
        expect(mockTaxCodesRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          name: 'Updated VAT',
        });
      });

      it('should update tax code type', async () => {
        const existing = createTaxCodeFixture({ type: 'vat' });
        const updated = { ...existing, type: 'gst' };

        mockTaxCodesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.update.mockResolvedValue(updated);

        const result = await service.updateTaxCode(existing.id, { type: 'gst' }, TEST_TENANT_ID);

        expect(result.type).toBe('gst');
      });

      it('should update isActive flag', async () => {
        const existing = createTaxCodeFixture({ isActive: true });
        const updated = { ...existing, isActive: false };

        mockTaxCodesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.update.mockResolvedValue(updated);

        const result = await service.updateTaxCode(
          existing.id,
          { isActive: false },
          TEST_TENANT_ID,
        );

        expect(result.isActive).toBe(false);
      });

      it('should throw NotFoundError for non-existent tax code', async () => {
        mockTaxCodesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateTaxCode('non-existent', { name: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(TaxCodeNotFoundError);
      });

      it('should reject updating glAccountId to empty (INV-TAX-003)', async () => {
        const existing = createTaxCodeFixture();
        mockTaxCodesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateTaxCode(
            existing.id,
            { glAccountId: '' as unknown as string },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(TaxCodeGlAccountRequiredError);
      });

      it('should reject duplicate code on update', async () => {
        const existing = createTaxCodeFixture({ code: 'VAT-STD' });
        const duplicate = createTaxCodeFixture({ id: 'other-id', code: 'VAT-NEW' });

        mockTaxCodesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.findByCode.mockResolvedValue(duplicate);

        await expect(
          service.updateTaxCode(existing.id, { code: 'VAT-NEW' }, TEST_TENANT_ID),
        ).rejects.toThrow(TaxCodeAlreadyExistsError);
      });

      it('should allow updating code to same value', async () => {
        const existing = createTaxCodeFixture({ code: 'VAT-STD' });
        const updated = { ...existing, code: 'VAT-STD' };

        mockTaxCodesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.update.mockResolvedValue(updated);

        const result = await service.updateTaxCode(
          existing.id,
          { code: 'VAT-STD' },
          TEST_TENANT_ID,
        );

        expect(result.code).toBe('VAT-STD');
        expect(mockTaxCodesRepo.findByCode).not.toHaveBeenCalled();
      });

      it('should scope code uniqueness check to tenant', async () => {
        const existing = createTaxCodeFixture({ code: 'VAT-STD' });
        const otherTenantCode = createTaxCodeFixture({ code: 'VAT-NEW' });

        mockTaxCodesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.findByCode.mockImplementation(async (_code: string, tenantId: string) => {
          if (tenantId === OTHER_TENANT_ID) return otherTenantCode;
          return undefined;
        });
        mockTaxCodesRepo.update.mockResolvedValue({ ...existing, code: 'VAT-NEW' });

        const result = await service.updateTaxCode(
          existing.id,
          { code: 'VAT-NEW' },
          TEST_TENANT_ID,
        );
        expect(result.code).toBe('VAT-NEW');
      });
    });

    describe('deleteTaxCode', () => {
      it('should delete tax code with no associated rates or rules', async () => {
        const existing = createTaxCodeFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.countRatesByTaxCodeId.mockResolvedValue(0);
        mockTaxCodesRepo.countAutoAssignmentRulesByTaxCodeId.mockResolvedValue(0);
        mockTaxCodesRepo.delete.mockResolvedValue(undefined);

        await service.deleteTaxCode(existing.id, TEST_TENANT_ID);

        expect(mockTaxCodesRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent tax code', async () => {
        mockTaxCodesRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteTaxCode('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeNotFoundError,
        );
      });

      it('should reject deletion of tax code with associated rates', async () => {
        const existing = createTaxCodeFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.countRatesByTaxCodeId.mockResolvedValue(3);

        await expect(service.deleteTaxCode(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeHasRatesError,
        );
      });

      it('should reject deletion of tax code with auto-assignment rules', async () => {
        const existing = createTaxCodeFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.countRatesByTaxCodeId.mockResolvedValue(0);
        mockTaxCodesRepo.countAutoAssignmentRulesByTaxCodeId.mockResolvedValue(2);

        await expect(service.deleteTaxCode(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeHasAutoAssignmentRulesError,
        );
      });

      it('should check rates before auto-assignment rules', async () => {
        const existing = createTaxCodeFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.countRatesByTaxCodeId.mockResolvedValue(1);
        mockTaxCodesRepo.countAutoAssignmentRulesByTaxCodeId.mockResolvedValue(2);

        await expect(service.deleteTaxCode(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeHasRatesError,
        );
        // Should not check rules if rates check fails first
        expect(mockTaxCodesRepo.countAutoAssignmentRulesByTaxCodeId).not.toHaveBeenCalled();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TAX RATE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tax Rate Service', () => {
    describe('createTaxRate', () => {
      it('should create tax rate for existing active tax code', async () => {
        const input = createTaxRateInputFixture();
        const taxCode = createTaxCodeFixture();
        const expected = createTaxRateFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxRatesRepo.hasOverlap.mockResolvedValue(false);
        mockTaxRatesRepo.create.mockResolvedValue(expected);

        const result = await service.createTaxRate(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockTaxCodesRepo.findById).toHaveBeenCalledWith(input.taxCodeId, TEST_TENANT_ID);
        expect(mockTaxRatesRepo.hasOverlap).toHaveBeenCalledWith(
          input.taxCodeId,
          input.effectiveDate,
          TEST_TENANT_ID,
        );
        expect(mockTaxRatesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...input,
            tenantId: TEST_TENANT_ID,
            expiryDate: input.expiryDate,
          }),
        );
      });

      it('should create tax rate without expiry date', async () => {
        const input = createTaxRateInputFixture({ expiryDate: undefined });
        const taxCode = createTaxCodeFixture();
        const expected = createTaxRateFixture({ expiryDate: null });

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxRatesRepo.hasOverlap.mockResolvedValue(false);
        mockTaxRatesRepo.create.mockResolvedValue(expected);

        await service.createTaxRate(input, TEST_TENANT_ID);

        expect(mockTaxRatesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ expiryDate: null }),
        );
      });

      it('should throw NotFoundError for non-existent tax code', async () => {
        const input = createTaxRateInputFixture({ taxCodeId: 'non-existent' });

        mockTaxCodesRepo.findById.mockResolvedValue(undefined);

        await expect(service.createTaxRate(input, TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeNotFoundError,
        );
      });

      it('should reject creating rate for inactive tax code', async () => {
        const input = createTaxRateInputFixture();
        const inactiveTaxCode = createInactiveTaxCodeFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(inactiveTaxCode);

        await expect(service.createTaxRate(input, TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeInactiveError,
        );
      });

      it('should reject overlapping effective dates (BR-014)', async () => {
        const input = createTaxRateInputFixture();
        const taxCode = createTaxCodeFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxRatesRepo.hasOverlap.mockResolvedValue(true);

        await expect(service.createTaxRate(input, TEST_TENANT_ID)).rejects.toThrow(
          TaxRateOverlapError,
        );
      });

      it('should scope overlap check to tenant', async () => {
        const input = createTaxRateInputFixture();
        const taxCode = createTaxCodeFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxRatesRepo.hasOverlap.mockResolvedValue(false);
        mockTaxRatesRepo.create.mockResolvedValue(createTaxRateFixture());

        await service.createTaxRate(input, TEST_TENANT_ID);

        expect(mockTaxRatesRepo.hasOverlap).toHaveBeenCalledWith(
          input.taxCodeId,
          input.effectiveDate,
          TEST_TENANT_ID,
        );
      });
    });

    describe('getTaxRate', () => {
      it('should return tax rate by id', async () => {
        const taxRate = createTaxRateFixture();
        mockTaxRatesRepo.findById.mockResolvedValue(taxRate);

        const result = await service.getTaxRate(taxRate.id, TEST_TENANT_ID);

        expect(result).toEqual(taxRate);
        expect(mockTaxRatesRepo.findById).toHaveBeenCalledWith(taxRate.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent tax rate', async () => {
        mockTaxRatesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getTaxRate('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          TaxRateNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockTaxRatesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getTaxRate('tr-1', OTHER_TENANT_ID)).rejects.toThrow(
          TaxRateNotFoundError,
        );
        expect(mockTaxRatesRepo.findById).toHaveBeenCalledWith('tr-1', OTHER_TENANT_ID);
      });
    });

    describe('listTaxRates', () => {
      it('should return paginated tax rates', async () => {
        const rates = [createTaxRateFixture()];
        mockTaxRatesRepo.findMany.mockResolvedValue({ data: rates, total: 1 });

        const result = await service.listTaxRates(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no tax rates exist', async () => {
        mockTaxRatesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listTaxRates(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockTaxRatesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listTaxRates(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockTaxRatesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 20 }),
        );
      });

      it('should filter by taxCodeId', async () => {
        mockTaxRatesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listTaxRates(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          taxCodeId: 'tc-1',
        });

        expect(mockTaxRatesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ taxCodeId: 'tc-1' }),
        );
      });

      it('should filter by isActive', async () => {
        mockTaxRatesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listTaxRates(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          isActive: true,
        });

        expect(mockTaxRatesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ isActive: true }),
        );
      });
    });

    describe('updateTaxRate', () => {
      it('should update tax rate rate', async () => {
        const existing = createTaxRateFixture();
        const updated = { ...existing, rate: '0.2000' };

        mockTaxRatesRepo.findById.mockResolvedValue(existing);
        mockTaxRatesRepo.update.mockResolvedValue(updated);

        const result = await service.updateTaxRate(existing.id, { rate: '0.2000' }, TEST_TENANT_ID);

        expect(result.rate).toBe('0.2000');
      });

      it('should update tax rate effective date without overlap', async () => {
        const existing = createTaxRateFixture({ effectiveDate: '2026-01-01' });
        const updated = { ...existing, effectiveDate: '2026-06-01' };

        mockTaxRatesRepo.findById.mockResolvedValue(existing);
        mockTaxRatesRepo.hasOverlap.mockResolvedValue(false);
        mockTaxRatesRepo.update.mockResolvedValue(updated);

        const result = await service.updateTaxRate(
          existing.id,
          { effectiveDate: '2026-06-01' },
          TEST_TENANT_ID,
        );

        expect(result.effectiveDate).toBe('2026-06-01');
      });

      it('should throw NotFoundError for non-existent tax rate', async () => {
        mockTaxRatesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateTaxRate('non-existent', { rate: '0.1000' }, TEST_TENANT_ID),
        ).rejects.toThrow(TaxRateNotFoundError);
      });

      it('should reject overlapping effective date on update', async () => {
        const existing = createTaxRateFixture({ effectiveDate: '2026-01-01' });

        mockTaxRatesRepo.findById.mockResolvedValue(existing);
        mockTaxRatesRepo.hasOverlap.mockResolvedValue(true);

        await expect(
          service.updateTaxRate(existing.id, { effectiveDate: '2026-06-01' }, TEST_TENANT_ID),
        ).rejects.toThrow(TaxRateOverlapError);
      });

      it('should pass excludeId to overlap check on update', async () => {
        const existing = createTaxRateFixture({ effectiveDate: '2026-01-01' });

        mockTaxRatesRepo.findById.mockResolvedValue(existing);
        mockTaxRatesRepo.hasOverlap.mockResolvedValue(false);
        mockTaxRatesRepo.update.mockResolvedValue(existing);

        await service.updateTaxRate(existing.id, { effectiveDate: '2026-06-01' }, TEST_TENANT_ID);

        expect(mockTaxRatesRepo.hasOverlap).toHaveBeenCalledWith(
          existing.taxCodeId,
          '2026-06-01',
          TEST_TENANT_ID,
          existing.id,
        );
      });

      it('should reject update when expiry date is before effective date', async () => {
        const existing = createTaxRateFixture({
          effectiveDate: '2026-06-01',
          expiryDate: '2026-12-31',
        });

        mockTaxRatesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateTaxRate(existing.id, { expiryDate: '2026-01-01' }, TEST_TENANT_ID),
        ).rejects.toThrow(TaxRateOverlapError);
      });

      it('should update description to null', async () => {
        const existing = createTaxRateFixture({ description: 'Old desc' });
        const updated = { ...existing, description: null };

        mockTaxRatesRepo.findById.mockResolvedValue(existing);
        mockTaxRatesRepo.update.mockResolvedValue(updated);

        const result = await service.updateTaxRate(
          existing.id,
          { description: null },
          TEST_TENANT_ID,
        );

        expect(result.description).toBeNull();
      });
    });

    describe('deleteTaxRate', () => {
      it('should delete existing tax rate', async () => {
        const existing = createTaxRateFixture();

        mockTaxRatesRepo.findById.mockResolvedValue(existing);
        mockTaxRatesRepo.delete.mockResolvedValue(undefined);

        await service.deleteTaxRate(existing.id, TEST_TENANT_ID);

        expect(mockTaxRatesRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent tax rate', async () => {
        mockTaxRatesRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteTaxRate('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          TaxRateNotFoundError,
        );
      });

      it('should scope delete to tenant', async () => {
        mockTaxRatesRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteTaxRate('tr-1', OTHER_TENANT_ID)).rejects.toThrow(
          TaxRateNotFoundError,
        );
        expect(mockTaxRatesRepo.findById).toHaveBeenCalledWith('tr-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TAX CALCULATION SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tax Calculation Service', () => {
    describe('calculateTax', () => {
      it('should calculate tax amount for valid tax code and active rate', async () => {
        const taxCode = createTaxCodeFixture();
        const taxRate = createTaxRateFixture({ rate: '0.1500' });

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxRatesRepo.findActiveRateForDate.mockResolvedValue(taxRate);

        const result = await service.calculateTax(
          taxCode.id,
          '1000.00',
          '2026-07-01',
          TEST_TENANT_ID,
        );

        expect(result.taxCodeId).toBe(taxCode.id);
        expect(result.taxRateId).toBe(taxRate.id);
        expect(result.rate).toBe('0.1500');
        expect(result.taxableAmount).toBe('1000.00');
        expect(result.taxAmount).toBe('150.0000');
        expect(result.effectiveDate).toBe(taxRate.effectiveDate);
        expect(result.expiryDate).toBe(taxRate.expiryDate);
      });

      it('should calculate tax with decimal rate and amount', async () => {
        const taxCode = createTaxCodeFixture();
        const taxRate = createTaxRateFixture({ rate: '0.0750' });

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxRatesRepo.findActiveRateForDate.mockResolvedValue(taxRate);

        const result = await service.calculateTax(
          taxCode.id,
          '233.33',
          '2026-07-01',
          TEST_TENANT_ID,
        );

        expect(result.taxAmount).toBe('17.4997');
      });

      it('should calculate tax with zero amount', async () => {
        const taxCode = createTaxCodeFixture();
        const taxRate = createTaxRateFixture({ rate: '0.1500' });

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxRatesRepo.findActiveRateForDate.mockResolvedValue(taxRate);

        const result = await service.calculateTax(taxCode.id, '0', '2026-07-01', TEST_TENANT_ID);

        expect(result.taxAmount).toBe('0.0000');
      });

      it('should throw NotFoundError for non-existent tax code', async () => {
        mockTaxCodesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.calculateTax('non-existent', '100', '2026-07-01', TEST_TENANT_ID),
        ).rejects.toThrow(TaxCodeNotFoundError);
      });

      it('should reject calculation for inactive tax code', async () => {
        const inactiveTaxCode = createInactiveTaxCodeFixture();
        mockTaxCodesRepo.findById.mockResolvedValue(inactiveTaxCode);

        await expect(
          service.calculateTax(inactiveTaxCode.id, '100', '2026-07-01', TEST_TENANT_ID),
        ).rejects.toThrow(TaxCodeInactiveError);
      });

      it('should reject calculation for tax code without GL account (INV-TAX-003)', async () => {
        const noGlCode = createTaxCodeFixture({ glAccountId: null });
        mockTaxCodesRepo.findById.mockResolvedValue(noGlCode);

        await expect(
          service.calculateTax(noGlCode.id, '100', '2026-07-01', TEST_TENANT_ID),
        ).rejects.toThrow(TaxCodeGlAccountRequiredError);
      });

      it('should throw NotFoundError when no active rate found for date (BR-017)', async () => {
        const taxCode = createTaxCodeFixture();
        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxRatesRepo.findActiveRateForDate.mockResolvedValue(undefined);

        await expect(
          service.calculateTax(taxCode.id, '100', '2099-01-01', TEST_TENANT_ID),
        ).rejects.toThrow(TaxCodeNotFoundError);
      });

      it('should scope calculation to tenant', async () => {
        mockTaxCodesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.calculateTax('tc-1', '100', '2026-07-01', OTHER_TENANT_ID),
        ).rejects.toThrow(TaxCodeNotFoundError);

        expect(mockTaxCodesRepo.findById).toHaveBeenCalledWith('tc-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TAX AUTO-ASSIGNMENT RULE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tax Auto-Assignment Rule Service', () => {
    describe('createAutoAssignmentRule', () => {
      it('should create auto-assignment rule with unique priority', async () => {
        const input = createAutoAssignmentRuleInputFixture();
        const taxCode = createTaxCodeFixture();
        const expected = createAutoAssignmentRuleFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxAutoAssignmentRulesRepo.hasPriorityConflict.mockResolvedValue(false);
        mockTaxAutoAssignmentRulesRepo.create.mockResolvedValue(expected);

        const result = await service.createAutoAssignmentRule(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockTaxCodesRepo.findById).toHaveBeenCalledWith(input.taxCodeId, TEST_TENANT_ID);
        expect(mockTaxAutoAssignmentRulesRepo.hasPriorityConflict).toHaveBeenCalledWith(
          input.priority,
          TEST_TENANT_ID,
        );
        expect(mockTaxAutoAssignmentRulesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...input,
            tenantId: TEST_TENANT_ID,
            entityCategoryId: null,
            customerGroupId: null,
            itemCategoryId: null,
            regionCode: null,
          }),
        );
      });

      it('should create rule with optional fields', async () => {
        const input = createAutoAssignmentRuleInputFixture({
          entityCategoryId: 'cat-1',
          customerGroupId: 'cg-1',
          itemCategoryId: 'ic-1',
          regionCode: 'US-CA',
        });
        const taxCode = createTaxCodeFixture();
        const expected = createAutoAssignmentRuleFixture(input);

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxAutoAssignmentRulesRepo.hasPriorityConflict.mockResolvedValue(false);
        mockTaxAutoAssignmentRulesRepo.create.mockResolvedValue(expected);

        await service.createAutoAssignmentRule(input, TEST_TENANT_ID);

        expect(mockTaxAutoAssignmentRulesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            entityCategoryId: 'cat-1',
            customerGroupId: 'cg-1',
            itemCategoryId: 'ic-1',
            regionCode: 'US-CA',
          }),
        );
      });

      it('should throw NotFoundError for non-existent tax code', async () => {
        const input = createAutoAssignmentRuleInputFixture({ taxCodeId: 'non-existent' });

        mockTaxCodesRepo.findById.mockResolvedValue(undefined);

        await expect(service.createAutoAssignmentRule(input, TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeNotFoundError,
        );
      });

      it('should reject creating rule for inactive tax code', async () => {
        const input = createAutoAssignmentRuleInputFixture();
        const inactiveTaxCode = createInactiveTaxCodeFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(inactiveTaxCode);

        await expect(service.createAutoAssignmentRule(input, TEST_TENANT_ID)).rejects.toThrow(
          TaxCodeInactiveError,
        );
      });

      it('should reject duplicate priority (BR-016)', async () => {
        const input = createAutoAssignmentRuleInputFixture({ priority: 10 });
        const taxCode = createTaxCodeFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxAutoAssignmentRulesRepo.hasPriorityConflict.mockResolvedValue(true);

        await expect(service.createAutoAssignmentRule(input, TEST_TENANT_ID)).rejects.toThrow(
          TaxAutoAssignmentRulePriorityConflictError,
        );
      });

      it('should scope priority conflict check to tenant', async () => {
        const input = createAutoAssignmentRuleInputFixture({ priority: 10 });
        const taxCode = createTaxCodeFixture();

        mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
        mockTaxAutoAssignmentRulesRepo.hasPriorityConflict.mockResolvedValue(false);
        mockTaxAutoAssignmentRulesRepo.create.mockResolvedValue(createAutoAssignmentRuleFixture());

        await service.createAutoAssignmentRule(input, TEST_TENANT_ID);

        expect(mockTaxAutoAssignmentRulesRepo.hasPriorityConflict).toHaveBeenCalledWith(
          10,
          TEST_TENANT_ID,
        );
      });
    });

    describe('getAutoAssignmentRule', () => {
      it('should return rule by id', async () => {
        const rule = createAutoAssignmentRuleFixture();
        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(rule);

        const result = await service.getAutoAssignmentRule(rule.id, TEST_TENANT_ID);

        expect(result).toEqual(rule);
        expect(mockTaxAutoAssignmentRulesRepo.findById).toHaveBeenCalledWith(
          rule.id,
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent rule', async () => {
        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getAutoAssignmentRule('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          TaxAutoAssignmentRuleNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getAutoAssignmentRule('rule-1', OTHER_TENANT_ID)).rejects.toThrow(
          TaxAutoAssignmentRuleNotFoundError,
        );
        expect(mockTaxAutoAssignmentRulesRepo.findById).toHaveBeenCalledWith(
          'rule-1',
          OTHER_TENANT_ID,
        );
      });
    });

    describe('listAutoAssignmentRules', () => {
      it('should return paginated rules', async () => {
        const rules = [createAutoAssignmentRuleFixture()];
        mockTaxAutoAssignmentRulesRepo.findMany.mockResolvedValue({ data: rules, total: 1 });

        const result = await service.listAutoAssignmentRules(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no rules exist', async () => {
        mockTaxAutoAssignmentRulesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listAutoAssignmentRules(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockTaxAutoAssignmentRulesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listAutoAssignmentRules(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockTaxAutoAssignmentRulesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 20 }),
        );
      });

      it('should filter by isActive', async () => {
        mockTaxAutoAssignmentRulesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listAutoAssignmentRules(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          isActive: false,
        });

        expect(mockTaxAutoAssignmentRulesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ isActive: false }),
        );
      });
    });

    describe('updateAutoAssignmentRule', () => {
      it('should update rule name', async () => {
        const existing = createAutoAssignmentRuleFixture();
        const updated = { ...existing, name: 'Updated Rule' };

        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(existing);
        mockTaxAutoAssignmentRulesRepo.update.mockResolvedValue(updated);

        const result = await service.updateAutoAssignmentRule(
          existing.id,
          { name: 'Updated Rule' },
          TEST_TENANT_ID,
        );

        expect(result.name).toBe('Updated Rule');
      });

      it('should update rule priority without conflict', async () => {
        const existing = createAutoAssignmentRuleFixture({ priority: 10 });
        const updated = { ...existing, priority: 5 };

        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(existing);
        mockTaxAutoAssignmentRulesRepo.hasPriorityConflict.mockResolvedValue(false);
        mockTaxAutoAssignmentRulesRepo.update.mockResolvedValue(updated);

        const result = await service.updateAutoAssignmentRule(
          existing.id,
          { priority: 5 },
          TEST_TENANT_ID,
        );

        expect(result.priority).toBe(5);
      });

      it('should update tax code reference to active code', async () => {
        const existing = createAutoAssignmentRuleFixture();
        const newTaxCode = createTaxCodeFixture({ id: 'new-tc-1', code: 'NEW-VAT' });
        const updated = { ...existing, taxCodeId: 'new-tc-1' };

        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.findById.mockResolvedValue(newTaxCode);
        mockTaxAutoAssignmentRulesRepo.update.mockResolvedValue(updated);

        const result = await service.updateAutoAssignmentRule(
          existing.id,
          { taxCodeId: 'new-tc-1' },
          TEST_TENANT_ID,
        );

        expect(result.taxCodeId).toBe('new-tc-1');
      });

      it('should throw NotFoundError for non-existent rule', async () => {
        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateAutoAssignmentRule('non-existent', { name: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(TaxAutoAssignmentRuleNotFoundError);
      });

      it('should reject update with non-existent tax code', async () => {
        const existing = createAutoAssignmentRuleFixture();
        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateAutoAssignmentRule(
            existing.id,
            { taxCodeId: 'non-existent' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(TaxCodeNotFoundError);
      });

      it('should reject update with inactive tax code', async () => {
        const existing = createAutoAssignmentRuleFixture();
        const inactiveCode = createInactiveTaxCodeFixture({ id: 'inactive-1' });

        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(existing);
        mockTaxCodesRepo.findById.mockResolvedValue(inactiveCode);

        await expect(
          service.updateAutoAssignmentRule(
            existing.id,
            { taxCodeId: 'inactive-1' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(TaxCodeInactiveError);
      });

      it('should reject update with conflicting priority (BR-016)', async () => {
        const existing = createAutoAssignmentRuleFixture({ priority: 10 });

        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(existing);
        mockTaxAutoAssignmentRulesRepo.hasPriorityConflict.mockResolvedValue(true);

        await expect(
          service.updateAutoAssignmentRule(existing.id, { priority: 5 }, TEST_TENANT_ID),
        ).rejects.toThrow(TaxAutoAssignmentRulePriorityConflictError);
      });

      it('should pass excludeId to priority conflict check', async () => {
        const existing = createAutoAssignmentRuleFixture({ priority: 10 });

        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(existing);
        mockTaxAutoAssignmentRulesRepo.hasPriorityConflict.mockResolvedValue(false);
        mockTaxAutoAssignmentRulesRepo.update.mockResolvedValue(existing);

        await service.updateAutoAssignmentRule(existing.id, { priority: 20 }, TEST_TENANT_ID);

        expect(mockTaxAutoAssignmentRulesRepo.hasPriorityConflict).toHaveBeenCalledWith(
          20,
          TEST_TENANT_ID,
          existing.id,
        );
      });

      it('should not check priority conflict when priority unchanged', async () => {
        const existing = createAutoAssignmentRuleFixture({ priority: 10 });
        const updated = { ...existing, name: 'New Name' };

        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(existing);
        mockTaxAutoAssignmentRulesRepo.update.mockResolvedValue(updated);

        await service.updateAutoAssignmentRule(existing.id, { name: 'New Name' }, TEST_TENANT_ID);

        expect(mockTaxAutoAssignmentRulesRepo.hasPriorityConflict).not.toHaveBeenCalled();
      });
    });

    describe('deleteAutoAssignmentRule', () => {
      it('should delete existing rule', async () => {
        const existing = createAutoAssignmentRuleFixture();

        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(existing);
        mockTaxAutoAssignmentRulesRepo.delete.mockResolvedValue(undefined);

        await service.deleteAutoAssignmentRule(existing.id, TEST_TENANT_ID);

        expect(mockTaxAutoAssignmentRulesRepo.delete).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent rule', async () => {
        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deleteAutoAssignmentRule('non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(TaxAutoAssignmentRuleNotFoundError);
      });

      it('should scope delete to tenant', async () => {
        mockTaxAutoAssignmentRulesRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteAutoAssignmentRule('rule-1', OTHER_TENANT_ID)).rejects.toThrow(
          TaxAutoAssignmentRuleNotFoundError,
        );
        expect(mockTaxAutoAssignmentRulesRepo.findById).toHaveBeenCalledWith(
          'rule-1',
          OTHER_TENANT_ID,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-ASSIGNMENT RESOLUTION SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('resolveAutoAssignment', () => {
    it('should return tax calculation result for matching rule (BR-016)', async () => {
      const rule = createAutoAssignmentRuleFixture({ priority: 5 });
      const taxCode = createTaxCodeFixture();
      const taxRate = createTaxRateFixture({ rate: '0.1500' });

      mockTaxAutoAssignmentRulesRepo.findMatchingRules.mockResolvedValue([rule]);
      mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
      mockTaxRatesRepo.findActiveRateForDate.mockResolvedValue(taxRate);

      const result = await service.resolveAutoAssignment(
        {
          entityType: 'sales_invoice',
          transactionDate: '2026-07-01',
        },
        TEST_TENANT_ID,
      );

      expect(result).toBeDefined();
      expect(result?.taxCodeId).toBe(taxCode.id);
      expect(result?.taxRateId).toBe(taxRate.id);
      expect(result?.rate).toBe('0.1500');
    });

    it('should use first rule (lowest priority number = highest priority)', async () => {
      const lowPriority = createAutoAssignmentRuleFixture({
        id: 'rule-low',
        priority: 1,
        taxCodeId: 'tc-low',
      });
      const highPriority = createAutoAssignmentRuleFixture({
        id: 'rule-high',
        priority: 100,
        taxCodeId: 'tc-high',
      });

      const taxCodeLow = createTaxCodeFixture({ id: 'tc-low', code: 'LOW-VAT' });
      const taxRateLow = createTaxRateFixture({ rate: '0.0500', taxCodeId: 'tc-low' });

      mockTaxAutoAssignmentRulesRepo.findMatchingRules.mockResolvedValue([
        lowPriority,
        highPriority,
      ]);
      mockTaxCodesRepo.findById.mockResolvedValue(taxCodeLow);
      mockTaxRatesRepo.findActiveRateForDate.mockResolvedValue(taxRateLow);

      const result = await service.resolveAutoAssignment(
        {
          entityType: 'sales_invoice',
          transactionDate: '2026-07-01',
        },
        TEST_TENANT_ID,
      );

      expect(result?.taxCodeId).toBe('tc-low');
      expect(result?.rate).toBe('0.0500');
    });

    it('should return undefined when no matching rules exist', async () => {
      mockTaxAutoAssignmentRulesRepo.findMatchingRules.mockResolvedValue([]);

      const result = await service.resolveAutoAssignment(
        {
          entityType: 'sales_invoice',
          transactionDate: '2026-07-01',
        },
        TEST_TENANT_ID,
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined when matched rule tax code is inactive', async () => {
      const rule = createAutoAssignmentRuleFixture();
      const inactiveTaxCode = createInactiveTaxCodeFixture();

      mockTaxAutoAssignmentRulesRepo.findMatchingRules.mockResolvedValue([rule]);
      mockTaxCodesRepo.findById.mockResolvedValue(inactiveTaxCode);

      const result = await service.resolveAutoAssignment(
        {
          entityType: 'sales_invoice',
          transactionDate: '2026-07-01',
        },
        TEST_TENANT_ID,
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined when matched rule tax code not found', async () => {
      const rule = createAutoAssignmentRuleFixture();

      mockTaxAutoAssignmentRulesRepo.findMatchingRules.mockResolvedValue([rule]);
      mockTaxCodesRepo.findById.mockResolvedValue(undefined);

      const result = await service.resolveAutoAssignment(
        {
          entityType: 'sales_invoice',
          transactionDate: '2026-07-01',
        },
        TEST_TENANT_ID,
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined when no active rate found for date', async () => {
      const rule = createAutoAssignmentRuleFixture();
      const taxCode = createTaxCodeFixture();

      mockTaxAutoAssignmentRulesRepo.findMatchingRules.mockResolvedValue([rule]);
      mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
      mockTaxRatesRepo.findActiveRateForDate.mockResolvedValue(undefined);

      const result = await service.resolveAutoAssignment(
        {
          entityType: 'sales_invoice',
          transactionDate: '2099-01-01',
        },
        TEST_TENANT_ID,
      );

      expect(result).toBeUndefined();
    });

    it('should pass entity filters to matching rules', async () => {
      mockTaxAutoAssignmentRulesRepo.findMatchingRules.mockResolvedValue([]);

      await service.resolveAutoAssignment(
        {
          entityType: 'sales_invoice',
          entityCategoryId: 'cat-1',
          customerGroupId: 'cg-1',
          itemCategoryId: 'ic-1',
          regionCode: 'US-CA',
          transactionDate: '2026-07-01',
        },
        TEST_TENANT_ID,
      );

      expect(mockTaxAutoAssignmentRulesRepo.findMatchingRules).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        {
          entityType: 'sales_invoice',
          entityCategoryId: 'cat-1',
          customerGroupId: 'cg-1',
          itemCategoryId: 'ic-1',
          regionCode: 'US-CA',
        },
      );
    });

    it('should scope resolution to tenant', async () => {
      mockTaxAutoAssignmentRulesRepo.findMatchingRules.mockResolvedValue([]);

      await service.resolveAutoAssignment(
        {
          entityType: 'sales_invoice',
          transactionDate: '2026-07-01',
        },
        OTHER_TENANT_ID,
      );

      expect(mockTaxAutoAssignmentRulesRepo.findMatchingRules).toHaveBeenCalledWith(
        OTHER_TENANT_ID,
        expect.anything(),
      );
    });

    it('should return zero taxableAmount and taxAmount for caller calculation', async () => {
      const rule = createAutoAssignmentRuleFixture();
      const taxCode = createTaxCodeFixture();
      const taxRate = createTaxRateFixture();

      mockTaxAutoAssignmentRulesRepo.findMatchingRules.mockResolvedValue([rule]);
      mockTaxCodesRepo.findById.mockResolvedValue(taxCode);
      mockTaxRatesRepo.findActiveRateForDate.mockResolvedValue(taxRate);

      const result = await service.resolveAutoAssignment(
        {
          entityType: 'sales_invoice',
          transactionDate: '2026-07-01',
        },
        TEST_TENANT_ID,
      );

      expect(result?.taxableAmount).toBe('0');
      expect(result?.taxAmount).toBe('0');
    });
  });
});
