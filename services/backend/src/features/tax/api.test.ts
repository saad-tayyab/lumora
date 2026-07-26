import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TEST_TENANT_ID, mockSession } from '../../lib/test-utils';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    details?: Record<string, unknown>;
    constructor(code: string, message: string, opts?: { status?: number; details?: Record<string, unknown> }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
      this.details = opts?.details;
    }
    static unauthenticated(message: string) {
      return new MockAPIError('unauthenticated', message, { status: 401 });
    }
    static notFound(message: string) {
      return new MockAPIError('not_found', message, { status: 404 });
    }
    static badRequest(message: string) {
      return new MockAPIError('bad_request', message, { status: 400 });
    }
    static forbidden(message: string) {
      return new MockAPIError('forbidden', message, { status: 403 });
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));

const mockGetAuthData = vi.fn();
vi.mock('encore.dev/internal/codegen/auth', () => ({ getAuthData: () => mockGetAuthData() }));

const { mockService } = vi.hoisted(() => ({
  mockService: {
    createTaxCode: vi.fn(),
    getTaxCode: vi.fn(),
    listTaxCodes: vi.fn(),
    updateTaxCode: vi.fn(),
    deleteTaxCode: vi.fn(),
    createTaxRate: vi.fn(),
    getTaxRate: vi.fn(),
    listTaxRates: vi.fn(),
    updateTaxRate: vi.fn(),
    deleteTaxRate: vi.fn(),
    createAutoAssignmentRule: vi.fn(),
    getAutoAssignmentRule: vi.fn(),
    listAutoAssignmentRules: vi.fn(),
    updateAutoAssignmentRule: vi.fn(),
    deleteAutoAssignmentRule: vi.fn(),
    calculateTax: vi.fn(),
    resolveAutoAssignment: vi.fn(),
  },
}));

vi.mock('./service', () => mockService);

// ─── Import handlers AFTER mocking ───────────────────────────────────────────

import {
  createTaxCode,
  getTaxCode,
  listTaxCodes,
  updateTaxCode,
  deleteTaxCode,
  createTaxRate,
  getTaxRate,
  listTaxRates,
  updateTaxRate,
  deleteTaxRate,
  createAutoAssignmentRule,
  getAutoAssignmentRule,
  listAutoAssignmentRules,
  updateAutoAssignmentRule,
  deleteAutoAssignmentRule,
  calculateTax,
  resolveAutoAssignment,
} from './api';
import { ValidationError } from '../../lib/errors';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const UUID = '550e8400-e29b-41d4-a716-446655440000';

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthData.mockReturnValue(mockSession);
});

function expectUnauthenticated(promise: Promise<unknown>) {
  return expect(promise).rejects.toMatchObject({
    code: 'unauthenticated',
    message: 'not authenticated',
  });
}

function expectValidationError(promise: Promise<unknown>) {
  return expect(promise).rejects.toBeInstanceOf(ValidationError);
}

// ─── Tax Code Endpoints ──────────────────────────────────────────────────────

describe('createTaxCode', () => {
  const validBody = {
    code: 'VAT10',
    name: 'Standard VAT',
    type: 'vat',
    glAccountId: UUID,
    isClaimable: false,
    postingRule: 'output_liability',
    isActive: true,
  };

  it('creates a tax code', async () => {
    const expected = { id: UUID, ...validBody, tenantId: TEST_TENANT_ID };
    mockService.createTaxCode.mockResolvedValue(expected);

    const result = await createTaxCode(validBody);

    expect(result).toEqual(expected);
    expect(mockService.createTaxCode).toHaveBeenCalledWith(validBody, TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(createTaxCode(validBody));
  });

  it('throws ValidationError when code is missing', async () => {
    await expectValidationError(createTaxCode({ name: 'Test', type: 'vat', glAccountId: UUID }));
  });

  it('throws ValidationError when code is empty string', async () => {
    await expectValidationError(createTaxCode({ ...validBody, code: '' }));
  });

  it('throws ValidationError when type is invalid', async () => {
    await expectValidationError(createTaxCode({ ...validBody, type: 'invalid' }));
  });

  it('throws ValidationError when glAccountId is not a UUID', async () => {
    await expectValidationError(createTaxCode({ ...validBody, glAccountId: 'not-a-uuid' }));
  });

  it('propagates service errors', async () => {
    const err = new Error('duplicate code');
    mockService.createTaxCode.mockRejectedValue(err);
    await expect(createTaxCode(validBody)).rejects.toThrow('duplicate code');
  });

  it('applies default values for optional fields', async () => {
    const body = { code: 'GST5', name: 'GST', type: 'gst', glAccountId: UUID };
    mockService.createTaxCode.mockResolvedValue({ id: UUID, ...body, isActive: true });

    await createTaxCode(body);

    expect(mockService.createTaxCode).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'GST5', name: 'GST', type: 'gst', glAccountId: UUID }),
      TEST_TENANT_ID,
    );
  });
});

describe('getTaxCode', () => {
  it('returns a tax code', async () => {
    const expected = { id: UUID, code: 'VAT10' };
    mockService.getTaxCode.mockResolvedValue(expected);

    const result = await getTaxCode({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.getTaxCode).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(getTaxCode({ id: UUID }));
  });

  it('propagates service errors', async () => {
    mockService.getTaxCode.mockRejectedValue(new Error('not found'));
    await expect(getTaxCode({ id: UUID })).rejects.toThrow('not found');
  });
});

describe('listTaxCodes', () => {
  const paginatedResult = {
    data: [{ id: UUID, code: 'VAT10' }],
    total: 1,
    page: 1,
    limit: 20,
  };

  it('lists tax codes with defaults', async () => {
    mockService.listTaxCodes.mockResolvedValue(paginatedResult);

    const result = await listTaxCodes({});

    expect(result).toEqual(paginatedResult);
    expect(mockService.listTaxCodes).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      type: undefined,
      isActive: undefined,
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(listTaxCodes({}));
  });

  it('passes type and isActive filters', async () => {
    mockService.listTaxCodes.mockResolvedValue(paginatedResult);

    await listTaxCodes({ type: 'vat', isActive: true });

    expect(mockService.listTaxCodes).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      type: 'vat',
      isActive: true,
    });
  });

  it('validates pagination params - negative page', async () => {
    await expectValidationError(listTaxCodes({ page: -1 }));
  });

  it('validates pagination params - zero limit', async () => {
    await expectValidationError(listTaxCodes({ limit: 0 }));
  });

  it('validates pagination params - limit exceeds 100', async () => {
    await expectValidationError(listTaxCodes({ limit: 101 }));
  });

  it('propagates service errors', async () => {
    mockService.listTaxCodes.mockRejectedValue(new Error('db error'));
    await expect(listTaxCodes({})).rejects.toThrow('db error');
  });
});

describe('updateTaxCode', () => {
  it('updates a tax code', async () => {
    const expected = { id: UUID, name: 'Updated' };
    mockService.updateTaxCode.mockResolvedValue(expected);

    const result = await updateTaxCode({ id: UUID, name: 'Updated' });

    expect(result).toEqual(expected);
    expect(mockService.updateTaxCode).toHaveBeenCalledWith(UUID, { name: 'Updated' }, TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(updateTaxCode({ id: UUID, name: 'x' }));
  });

  it('throws ValidationError when type is invalid', async () => {
    await expectValidationError(
      updateTaxCode({ id: UUID, type: 'invalid' }),
    );
  });

  it('throws ValidationError when glAccountId is not a UUID', async () => {
    await expectValidationError(
      updateTaxCode({ id: UUID, glAccountId: 'bad' }),
    );
  });

  it('propagates service errors', async () => {
    mockService.updateTaxCode.mockRejectedValue(new Error('not found'));
    await expect(updateTaxCode({ id: UUID, name: 'x' })).rejects.toThrow('not found');
  });

  it('passes empty body when only id is provided', async () => {
    mockService.updateTaxCode.mockResolvedValue({ id: UUID });

    await updateTaxCode({ id: UUID });

    expect(mockService.updateTaxCode).toHaveBeenCalledWith(UUID, {}, TEST_TENANT_ID);
  });
});

describe('deleteTaxCode', () => {
  it('deletes a tax code', async () => {
    mockService.deleteTaxCode.mockResolvedValue(undefined);

    await deleteTaxCode({ id: UUID });

    expect(mockService.deleteTaxCode).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(deleteTaxCode({ id: UUID }));
  });

  it('propagates service errors', async () => {
    mockService.deleteTaxCode.mockRejectedValue(new Error('has rates'));
    await expect(deleteTaxCode({ id: UUID })).rejects.toThrow('has rates');
  });
});

// ─── Tax Rate Endpoints ──────────────────────────────────────────────────────

describe('createTaxRate', () => {
  const validRateBody = {
    taxCodeId: UUID,
    rate: '0.1',
    effectiveDate: '2026-01-01',
    isActive: true,
  };

  it('creates a tax rate', async () => {
    const expected = { id: UUID, ...validRateBody };
    mockService.createTaxRate.mockResolvedValue(expected);

    const result = await createTaxRate(validRateBody);

    expect(result).toEqual(expected);
    expect(mockService.createTaxRate).toHaveBeenCalledWith(validRateBody, TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(createTaxRate(validRateBody));
  });

  it('throws ValidationError when taxCodeId is missing', async () => {
    await expectValidationError(createTaxRate({ rate: '0.1', effectiveDate: '2026-01-01' }));
  });

  it('throws ValidationError when rate format is invalid', async () => {
    await expectValidationError(createTaxRate({ ...validRateBody, rate: 'abc' }));
  });

  it('throws ValidationError when effectiveDate is invalid format', async () => {
    await expectValidationError(createTaxRate({ ...validRateBody, effectiveDate: '01-01-2026' }));
  });

  it('throws ValidationError when expiryDate is before effectiveDate', async () => {
    await expectValidationError(
      createTaxRate({
        ...validRateBody,
        effectiveDate: '2026-06-01',
        expiryDate: '2026-01-01',
      }),
    );
  });

  it('allows null expiryDate', async () => {
    mockService.createTaxRate.mockResolvedValue({ id: UUID, ...validRateBody, expiryDate: null });

    const result = await createTaxRate({ ...validRateBody, expiryDate: null });

    expect(result).toBeDefined();
  });

  it('propagates service errors', async () => {
    mockService.createTaxRate.mockRejectedValue(new Error('overlap'));
    await expect(createTaxRate(validRateBody)).rejects.toThrow('overlap');
  });
});

describe('getTaxRate', () => {
  it('returns a tax rate', async () => {
    const expected = { id: UUID, rate: '0.1' };
    mockService.getTaxRate.mockResolvedValue(expected);

    const result = await getTaxRate({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.getTaxRate).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(getTaxRate({ id: UUID }));
  });

  it('propagates service errors', async () => {
    mockService.getTaxRate.mockRejectedValue(new Error('not found'));
    await expect(getTaxRate({ id: UUID })).rejects.toThrow('not found');
  });
});

describe('listTaxRates', () => {
  const paginatedResult = {
    data: [{ id: UUID, rate: '0.1' }],
    total: 1,
    page: 1,
    limit: 20,
  };

  it('lists tax rates with defaults', async () => {
    mockService.listTaxRates.mockResolvedValue(paginatedResult);

    const result = await listTaxRates({});

    expect(result).toEqual(paginatedResult);
    expect(mockService.listTaxRates).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      taxCodeId: undefined,
      isActive: undefined,
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(listTaxRates({}));
  });

  it('passes filters', async () => {
    mockService.listTaxRates.mockResolvedValue(paginatedResult);

    await listTaxRates({ taxCodeId: UUID, isActive: false });

    expect(mockService.listTaxRates).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      taxCodeId: UUID,
      isActive: false,
    });
  });

  it('validates pagination params', async () => {
    await expectValidationError(listTaxRates({ limit: -1 }));
  });

  it('propagates service errors', async () => {
    mockService.listTaxRates.mockRejectedValue(new Error('db error'));
    await expect(listTaxRates({})).rejects.toThrow('db error');
  });
});

describe('updateTaxRate', () => {
  it('updates a tax rate', async () => {
    const expected = { id: UUID, rate: '0.15' };
    mockService.updateTaxRate.mockResolvedValue(expected);

    const result = await updateTaxRate({ id: UUID, rate: '0.15' });

    expect(result).toEqual(expected);
    expect(mockService.updateTaxRate).toHaveBeenCalledWith(
      UUID,
      { rate: '0.15' },
      TEST_TENANT_ID,
    );
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(updateTaxRate({ id: UUID, rate: '0.15' }));
  });

  it('throws ValidationError when rate format is invalid', async () => {
    await expectValidationError(updateTaxRate({ id: UUID, rate: 'abc' }));
  });

  it('throws ValidationError when effectiveDate is invalid', async () => {
    await expectValidationError(updateTaxRate({ id: UUID, effectiveDate: 'bad-date' }));
  });

  it('throws ValidationError when expiryDate is before effectiveDate', async () => {
    await expectValidationError(
      updateTaxRate({
        id: UUID,
        effectiveDate: '2026-06-01',
        expiryDate: '2026-01-01',
      }),
    );
  });

  it('propagates service errors', async () => {
    mockService.updateTaxRate.mockRejectedValue(new Error('not found'));
    await expect(updateTaxRate({ id: UUID, rate: '0.15' })).rejects.toThrow('not found');
  });

  it('passes empty body when only id provided', async () => {
    mockService.updateTaxRate.mockResolvedValue({ id: UUID });

    await updateTaxRate({ id: UUID });

    expect(mockService.updateTaxRate).toHaveBeenCalledWith(UUID, {}, TEST_TENANT_ID);
  });
});

describe('deleteTaxRate', () => {
  it('deletes a tax rate', async () => {
    mockService.deleteTaxRate.mockResolvedValue(undefined);

    await deleteTaxRate({ id: UUID });

    expect(mockService.deleteTaxRate).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(deleteTaxRate({ id: UUID }));
  });

  it('propagates service errors', async () => {
    mockService.deleteTaxRate.mockRejectedValue(new Error('not found'));
    await expect(deleteTaxRate({ id: UUID })).rejects.toThrow('not found');
  });
});

// ─── Auto-Assignment Rule Endpoints ──────────────────────────────────────────

describe('createAutoAssignmentRule', () => {
  const validRuleBody = {
    name: 'Standard Rule',
    priority: 0,
    taxCodeId: UUID,
    entityType: 'invoice_line',
    isActive: true,
  };

  it('creates an auto-assignment rule', async () => {
    const expected = { id: UUID, ...validRuleBody };
    mockService.createAutoAssignmentRule.mockResolvedValue(expected);

    const result = await createAutoAssignmentRule(validRuleBody);

    expect(result).toEqual(expected);
    expect(mockService.createAutoAssignmentRule).toHaveBeenCalledWith(
      validRuleBody,
      TEST_TENANT_ID,
    );
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(createAutoAssignmentRule(validRuleBody));
  });

  it('throws ValidationError when name is missing', async () => {
    await expectValidationError(
      createAutoAssignmentRule({ taxCodeId: UUID, entityType: 'x', priority: 0 }),
    );
  });

  it('throws ValidationError when entityType is missing', async () => {
    await expectValidationError(
      createAutoAssignmentRule({ name: 'Rule', taxCodeId: UUID, priority: 0 }),
    );
  });

  it('throws ValidationError when taxCodeId is not a UUID', async () => {
    await expectValidationError(
      createAutoAssignmentRule({ ...validRuleBody, taxCodeId: 'not-uuid' }),
    );
  });

  it('throws ValidationError when priority is negative', async () => {
    await expectValidationError(
      createAutoAssignmentRule({ ...validRuleBody, priority: -1 }),
    );
  });

  it('propagates service errors', async () => {
    mockService.createAutoAssignmentRule.mockRejectedValue(new Error('priority conflict'));
    await expect(createAutoAssignmentRule(validRuleBody)).rejects.toThrow('priority conflict');
  });
});

describe('getAutoAssignmentRule', () => {
  it('returns an auto-assignment rule', async () => {
    const expected = { id: UUID, name: 'Rule' };
    mockService.getAutoAssignmentRule.mockResolvedValue(expected);

    const result = await getAutoAssignmentRule({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.getAutoAssignmentRule).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(getAutoAssignmentRule({ id: UUID }));
  });

  it('propagates service errors', async () => {
    mockService.getAutoAssignmentRule.mockRejectedValue(new Error('not found'));
    await expect(getAutoAssignmentRule({ id: UUID })).rejects.toThrow('not found');
  });
});

describe('listAutoAssignmentRules', () => {
  const paginatedResult = {
    data: [{ id: UUID, name: 'Rule' }],
    total: 1,
    page: 1,
    limit: 20,
  };

  it('lists rules with defaults', async () => {
    mockService.listAutoAssignmentRules.mockResolvedValue(paginatedResult);

    const result = await listAutoAssignmentRules({});

    expect(result).toEqual(paginatedResult);
    expect(mockService.listAutoAssignmentRules).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      isActive: undefined,
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(listAutoAssignmentRules({}));
  });

  it('passes isActive filter', async () => {
    mockService.listAutoAssignmentRules.mockResolvedValue(paginatedResult);

    await listAutoAssignmentRules({ isActive: true });

    expect(mockService.listAutoAssignmentRules).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      isActive: true,
    });
  });

  it('validates pagination params', async () => {
    await expectValidationError(listAutoAssignmentRules({ page: 0 }));
  });

  it('propagates service errors', async () => {
    mockService.listAutoAssignmentRules.mockRejectedValue(new Error('db error'));
    await expect(listAutoAssignmentRules({})).rejects.toThrow('db error');
  });
});

describe('updateAutoAssignmentRule', () => {
  it('updates an auto-assignment rule', async () => {
    const expected = { id: UUID, name: 'Updated Rule' };
    mockService.updateAutoAssignmentRule.mockResolvedValue(expected);

    const result = await updateAutoAssignmentRule({ id: UUID, name: 'Updated Rule' });

    expect(result).toEqual(expected);
    expect(mockService.updateAutoAssignmentRule).toHaveBeenCalledWith(
      UUID,
      { name: 'Updated Rule' },
      TEST_TENANT_ID,
    );
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(
      updateAutoAssignmentRule({ id: UUID, name: 'x' }),
    );
  });

  it('throws ValidationError when taxCodeId is invalid UUID', async () => {
    await expectValidationError(
      updateAutoAssignmentRule({ id: UUID, taxCodeId: 'bad' }),
    );
  });

  it('throws ValidationError when priority is negative', async () => {
    await expectValidationError(
      updateAutoAssignmentRule({ id: UUID, priority: -5 }),
    );
  });

  it('propagates service errors', async () => {
    mockService.updateAutoAssignmentRule.mockRejectedValue(new Error('not found'));
    await expect(
      updateAutoAssignmentRule({ id: UUID, name: 'x' }),
    ).rejects.toThrow('not found');
  });

  it('passes empty body when only id provided', async () => {
    mockService.updateAutoAssignmentRule.mockResolvedValue({ id: UUID });

    await updateAutoAssignmentRule({ id: UUID });

    expect(mockService.updateAutoAssignmentRule).toHaveBeenCalledWith(
      UUID,
      {},
      TEST_TENANT_ID,
    );
  });
});

describe('deleteAutoAssignmentRule', () => {
  it('deletes an auto-assignment rule', async () => {
    mockService.deleteAutoAssignmentRule.mockResolvedValue(undefined);

    await deleteAutoAssignmentRule({ id: UUID });

    expect(mockService.deleteAutoAssignmentRule).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(deleteAutoAssignmentRule({ id: UUID }));
  });

  it('propagates service errors', async () => {
    mockService.deleteAutoAssignmentRule.mockRejectedValue(new Error('not found'));
    await expect(deleteAutoAssignmentRule({ id: UUID })).rejects.toThrow('not found');
  });
});

// ─── Tax Calculation Endpoints ───────────────────────────────────────────────

describe('calculateTax', () => {
  const validCalcBody = {
    taxCodeId: UUID,
    taxableAmount: '100.00',
    transactionDate: '2026-01-01',
  };

  const mockResult = {
    taxCodeId: UUID,
    taxRateId: UUID,
    rate: '0.1',
    taxableAmount: '100.00',
    taxAmount: '10.0000',
    effectiveDate: '2026-01-01',
    expiryDate: null,
  };

  it('calculates tax', async () => {
    mockService.calculateTax.mockResolvedValue(mockResult);

    const result = await calculateTax(validCalcBody);

    expect(result).toEqual(mockResult);
    expect(mockService.calculateTax).toHaveBeenCalledWith(
      UUID,
      '100.00',
      '2026-01-01',
      TEST_TENANT_ID,
    );
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(calculateTax(validCalcBody));
  });

  it('throws ValidationError when taxCodeId is missing', async () => {
    await expectValidationError(calculateTax({ taxableAmount: '100', transactionDate: '2026-01-01' }));
  });

  it('throws ValidationError when taxableAmount is missing', async () => {
    await expectValidationError(calculateTax({ taxCodeId: UUID, transactionDate: '2026-01-01' }));
  });

  it('throws ValidationError when transactionDate is invalid format', async () => {
    await expectValidationError(
      calculateTax({ taxCodeId: UUID, taxableAmount: '100', transactionDate: '01/01/2026' }),
    );
  });

  it('throws ValidationError when taxableAmount is not a valid decimal', async () => {
    await expectValidationError(
      calculateTax({ taxCodeId: UUID, taxableAmount: 'abc', transactionDate: '2026-01-01' }),
    );
  });

  it('propagates service errors', async () => {
    mockService.calculateTax.mockRejectedValue(new Error('no active rate'));
    await expect(calculateTax(validCalcBody)).rejects.toThrow('no active rate');
  });
});

describe('resolveAutoAssignment', () => {
  const validResolveBody = {
    entityType: 'invoice_line',
    transactionDate: '2026-01-01',
  };

  const mockResult = {
    taxCodeId: UUID,
    taxRateId: UUID,
    rate: '0.1',
    taxableAmount: '0',
    taxAmount: '0',
    effectiveDate: '2026-01-01',
    expiryDate: null,
  };

  it('resolves auto-assignment', async () => {
    mockService.resolveAutoAssignment.mockResolvedValue(mockResult);

    const result = await resolveAutoAssignment(validResolveBody);

    expect(result).toEqual(mockResult);
    expect(mockService.resolveAutoAssignment).toHaveBeenCalledWith(
      validResolveBody,
      TEST_TENANT_ID,
    );
  });

  it('throws notFound when no rules match', async () => {
    mockService.resolveAutoAssignment.mockResolvedValue(undefined);

    await expect(resolveAutoAssignment(validResolveBody)).rejects.toThrow();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);
    await expectUnauthenticated(resolveAutoAssignment(validResolveBody));
  });

  it('throws ValidationError when entityType is missing', async () => {
    await expectValidationError(
      resolveAutoAssignment({ transactionDate: '2026-01-01' }),
    );
  });

  it('throws ValidationError when transactionDate is invalid', async () => {
    await expectValidationError(
      resolveAutoAssignment({ entityType: 'x', transactionDate: 'bad' }),
    );
  });

  it('throws ValidationError when transactionDate is missing', async () => {
    await expectValidationError(
      resolveAutoAssignment({ entityType: 'invoice_line' }),
    );
  });

  it('passes optional fields when provided', async () => {
    mockService.resolveAutoAssignment.mockResolvedValue(mockResult);

    await resolveAutoAssignment({
      entityType: 'invoice_line',
      entityCategoryId: UUID,
      customerGroupId: UUID,
      itemCategoryId: UUID,
      regionCode: 'US-CA',
      transactionDate: '2026-01-01',
    });

    expect(mockService.resolveAutoAssignment).toHaveBeenCalledWith(
      {
        entityType: 'invoice_line',
        entityCategoryId: UUID,
        customerGroupId: UUID,
        itemCategoryId: UUID,
        regionCode: 'US-CA',
        transactionDate: '2026-01-01',
      },
      TEST_TENANT_ID,
    );
  });

  it('propagates service errors', async () => {
    mockService.resolveAutoAssignment.mockRejectedValue(new Error('service error'));
    await expect(resolveAutoAssignment(validResolveBody)).rejects.toThrow('service error');
  });
});

// ─── Auth edge cases ─────────────────────────────────────────────────────────

describe('auth edge cases', () => {
  it('all endpoints use correct tenantId from auth', async () => {
    const customTenant = { ...mockSession, tenantId: 'custom-tenant' };
    mockGetAuthData.mockReturnValue(customTenant);

    mockService.createTaxCode.mockResolvedValue({});
    await createTaxCode({
      code: 'X', name: 'X', type: 'vat', glAccountId: UUID,
    });
    expect(mockService.createTaxCode).toHaveBeenCalledWith(expect.anything(), 'custom-tenant');

    mockService.getTaxCode.mockResolvedValue({});
    await getTaxCode({ id: UUID });
    expect(mockService.getTaxCode).toHaveBeenCalledWith(UUID, 'custom-tenant');

    mockService.listTaxCodes.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    await listTaxCodes({});
    expect(mockService.listTaxCodes).toHaveBeenCalledWith('custom-tenant', expect.anything());

    mockService.updateTaxCode.mockResolvedValue({});
    await updateTaxCode({ id: UUID });
    expect(mockService.updateTaxCode).toHaveBeenCalledWith(UUID, {}, 'custom-tenant');

    mockService.deleteTaxCode.mockResolvedValue(undefined);
    await deleteTaxCode({ id: UUID });
    expect(mockService.deleteTaxCode).toHaveBeenCalledWith(UUID, 'custom-tenant');

    mockService.createTaxRate.mockResolvedValue({});
    await createTaxRate({ taxCodeId: UUID, rate: '0.1', effectiveDate: '2026-01-01' });
    expect(mockService.createTaxRate).toHaveBeenCalledWith(expect.anything(), 'custom-tenant');

    mockService.getTaxRate.mockResolvedValue({});
    await getTaxRate({ id: UUID });
    expect(mockService.getTaxRate).toHaveBeenCalledWith(UUID, 'custom-tenant');

    mockService.listTaxRates.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    await listTaxRates({});
    expect(mockService.listTaxRates).toHaveBeenCalledWith('custom-tenant', expect.anything());

    mockService.updateTaxRate.mockResolvedValue({});
    await updateTaxRate({ id: UUID });
    expect(mockService.updateTaxRate).toHaveBeenCalledWith(UUID, {}, 'custom-tenant');

    mockService.deleteTaxRate.mockResolvedValue(undefined);
    await deleteTaxRate({ id: UUID });
    expect(mockService.deleteTaxRate).toHaveBeenCalledWith(UUID, 'custom-tenant');

    mockService.createAutoAssignmentRule.mockResolvedValue({});
    await createAutoAssignmentRule({
      name: 'R', taxCodeId: UUID, entityType: 'x', priority: 0,
    });
    expect(mockService.createAutoAssignmentRule).toHaveBeenCalledWith(
      expect.anything(),
      'custom-tenant',
    );

    mockService.getAutoAssignmentRule.mockResolvedValue({});
    await getAutoAssignmentRule({ id: UUID });
    expect(mockService.getAutoAssignmentRule).toHaveBeenCalledWith(UUID, 'custom-tenant');

    mockService.listAutoAssignmentRules.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    await listAutoAssignmentRules({});
    expect(mockService.listAutoAssignmentRules).toHaveBeenCalledWith('custom-tenant', expect.anything());

    mockService.updateAutoAssignmentRule.mockResolvedValue({});
    await updateAutoAssignmentRule({ id: UUID });
    expect(mockService.updateAutoAssignmentRule).toHaveBeenCalledWith(UUID, {}, 'custom-tenant');

    mockService.deleteAutoAssignmentRule.mockResolvedValue(undefined);
    await deleteAutoAssignmentRule({ id: UUID });
    expect(mockService.deleteAutoAssignmentRule).toHaveBeenCalledWith(UUID, 'custom-tenant');

    mockService.calculateTax.mockResolvedValue({});
    await calculateTax({ taxCodeId: UUID, taxableAmount: '100', transactionDate: '2026-01-01' });
    expect(mockService.calculateTax).toHaveBeenCalledWith(
      UUID, '100', '2026-01-01', 'custom-tenant',
    );

    mockService.resolveAutoAssignment.mockResolvedValue(undefined);
    await expect(
      resolveAutoAssignment({ entityType: 'x', transactionDate: '2026-01-01' }),
    ).rejects.toThrow();
    expect(mockService.resolveAutoAssignment).toHaveBeenCalledWith(
      expect.anything(),
      'custom-tenant',
    );
  });
});
