/**
 * Accounts Payable — API Handler Tests
 *
 * @module features/ap/api.test
 * @description Unit tests for all 21 AP API endpoints.
 *              Mocks encore.dev/api, ~encore/auth, ./service, and ./repo.
 *              Tests happy paths, authentication, validation, and error propagation.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';

// =============================================================================
// Mocks
// =============================================================================

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    details?: Record<string, string[]>;
    constructor(code: string, message: string, opts?: { status?: number; details?: Record<string, string[]> }) {
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
    static internal(message: string) {
      return new MockAPIError('internal', message, { status: 500 });
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));

const mockGetAuthData = vi.fn();
vi.mock('~encore/auth', () => ({ getAuthData: () => mockGetAuthData() }));

vi.mock('./service', () => ({
  createVendor: vi.fn(),
  getVendor: vi.fn(),
  listVendors: vi.fn(),
  updateVendor: vi.fn(),
  deleteVendor: vi.fn(),
  createBill: vi.fn(),
  getBill: vi.fn(),
  listBills: vi.fn(),
  updateBill: vi.fn(),
  deleteBill: vi.fn(),
  submitBillForApproval: vi.fn(),
  approveBill: vi.fn(),
  voidBill: vi.fn(),
  addBillLineItem: vi.fn(),
  updateBillLineItem: vi.fn(),
  deleteBillLineItem: vi.fn(),
  createVendorPayment: vi.fn(),
  getVendorPayment: vi.fn(),
  listVendorPayments: vi.fn(),
  deleteVendorPayment: vi.fn(),
}));

vi.mock('./repo', () => ({
  billLineItemRepo: {
    findByBillId: vi.fn().mockResolvedValue([]),
  },
}));

// =============================================================================
// Import handlers AFTER mocking
// =============================================================================

import * as api from './api';
import * as service from './service';
import { billLineItemRepo } from './repo';

// =============================================================================
// Helpers
// =============================================================================

function svcError(code: string, message: string): Error & { code: string } {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}

// =============================================================================
// Test Data
// =============================================================================

const mockAuth = { tenantId: TEST_TENANT_ID, userId: TEST_USER_ID, userID: TEST_USER_ID };

const mockVendor = {
  id: 'aaaaaaaa-bbbb-4ccc-8ddd-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Acme Corp',
  code: 'ACME',
  currency: 'USD',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockBill = {
  id: 'aaaaaaaa-bbbb-4ccc-8ddd-000000000002',
  tenantId: TEST_TENANT_ID,
  vendorId: mockVendor.id,
  billNumber: 'BILL-001',
  status: 'draft' as const,
  billDate: '2026-01-15',
  dueDate: '2026-02-15',
  subtotal: '100.0000',
  taxAmount: '10.0000',
  totalAmount: '110.0000',
  currency: 'USD',
  notes: null,
  purchaseOrderId: null,
  createdBy: TEST_USER_ID,
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
};

const mockLineItem = {
  id: 'aaaaaaaa-bbbb-4ccc-8ddd-000000000003',
  billId: mockBill.id,
  description: 'Widget',
  quantity: '10',
  unitPrice: '10.00',
  amount: '100.00',
  taxRate: '10',
  taxAmount: '10.00',
  sortOrder: 0,
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
};

const mockPayment = {
  id: 'aaaaaaaa-bbbb-4ccc-8ddd-000000000004',
  tenantId: TEST_TENANT_ID,
  vendorId: mockVendor.id,
  billId: mockBill.id,
  amount: '110.00',
  paymentDate: '2026-02-01',
  paymentMethod: 'bank_transfer',
  referenceNumber: 'REF-001',
  bankAccountId: null,
  currency: 'USD',
  notes: null,
  createdBy: TEST_USER_ID,
  createdAt: '2026-02-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
};

// =============================================================================
// Setup
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthData.mockReturnValue(mockAuth);
});

// =============================================================================
// Vendor Endpoints
// =============================================================================

describe('createVendor', () => {
  it('creates a vendor with valid input', async () => {
    vi.mocked(service.createVendor).mockResolvedValue(mockVendor as never);

    const result = await api.createVendor({
      name: 'Acme Corp',
      code: 'ACME',
      currency: 'USD',
    });

    expect(service.createVendor).toHaveBeenCalledWith(
      { name: 'Acme Corp', code: 'ACME', currency: 'USD', isActive: true },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    expect(result).toEqual(mockVendor);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      api.createVendor({ name: 'Acme Corp', code: 'ACME' }),
    ).rejects.toThrow('not authenticated');
  });

  it('throws validation_error when name is empty', async () => {
    await expect(
      api.createVendor({ name: '', code: 'ACME' }),
    ).rejects.toThrow('Invalid request');
  });

  it('throws validation_error when code is empty', async () => {
    await expect(
      api.createVendor({ name: 'Acme Corp', code: '' }),
    ).rejects.toThrow('Invalid request');
  });

  it('propagates VendorCodeConflictError from service', async () => {
    vi.mocked(service.createVendor).mockRejectedValue(
      svcError('VENDOR_CODE_CONFLICT', 'Vendor with code "ACME" already exists'),
    );

    await expect(
      api.createVendor({ name: 'Acme Corp', code: 'ACME' }),
    ).rejects.toThrow('already exists');
  });
});

describe('getVendor', () => {
  it('returns a vendor by id', async () => {
    vi.mocked(service.getVendor).mockResolvedValue(mockVendor as never);

    const result = await api.getVendor({ id: mockVendor.id });

    expect(service.getVendor).toHaveBeenCalledWith(mockVendor.id, TEST_TENANT_ID);
    expect(result).toEqual(mockVendor);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.getVendor({ id: mockVendor.id })).rejects.toThrow('not authenticated');
  });

  it('propagates VendorNotFoundError from service', async () => {
    vi.mocked(service.getVendor).mockRejectedValue(
      svcError('VENDOR_NOT_FOUND', 'Vendor not found'),
    );

    await expect(api.getVendor({ id: 'nonexistent-id' })).rejects.toThrow('Vendor not found');
  });
});

describe('listVendors', () => {
  it('lists vendors with default pagination', async () => {
    const listResult = { data: [mockVendor], total: 1, page: 1, limit: 20 };
    vi.mocked(service.listVendors).mockResolvedValue(listResult as never);

    const result = await api.listVendors({});

    expect(service.listVendors).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      search: undefined,
    });
    expect(result).toEqual(listResult);
  });

  it('lists vendors with search parameter', async () => {
    const listResult = { data: [mockVendor], total: 1, page: 1, limit: 10 };
    vi.mocked(service.listVendors).mockResolvedValue(listResult as never);

    const result = await api.listVendors({ page: 1, limit: 10, search: 'acme' });

    expect(service.listVendors).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 10,
      search: 'acme',
    });
    expect(result).toEqual(listResult);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.listVendors({})).rejects.toThrow('not authenticated');
  });
});

describe('updateVendor', () => {
  it('updates a vendor with valid input', async () => {
    const updated = { ...mockVendor, name: 'Acme Inc' };
    vi.mocked(service.updateVendor).mockResolvedValue(updated as never);

    const result = await api.updateVendor({ id: mockVendor.id, name: 'Acme Inc' });

    expect(service.updateVendor).toHaveBeenCalledWith(
      mockVendor.id,
      { name: 'Acme Inc' },
      TEST_TENANT_ID,
    );
    expect(result).toEqual(updated);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      api.updateVendor({ id: mockVendor.id, name: 'Acme Inc' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates VendorNotFoundError from service', async () => {
    vi.mocked(service.updateVendor).mockRejectedValue(
      svcError('VENDOR_NOT_FOUND', 'Vendor not found'),
    );

    await expect(
      api.updateVendor({ id: 'nonexistent-id', name: 'Acme Inc' }),
    ).rejects.toThrow('Vendor not found');
  });

  it('throws validation_error for invalid currency length', async () => {
    await expect(
      api.updateVendor({ id: mockVendor.id, currency: 'US' }),
    ).rejects.toThrow('Invalid request');
  });
});

describe('deleteVendor', () => {
  it('soft-deletes a vendor', async () => {
    vi.mocked(service.deleteVendor).mockResolvedValue(undefined);

    await api.deleteVendor({ id: mockVendor.id });

    expect(service.deleteVendor).toHaveBeenCalledWith(mockVendor.id, TEST_TENANT_ID);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.deleteVendor({ id: mockVendor.id })).rejects.toThrow('not authenticated');
  });

  it('propagates VendorNotFoundError from service', async () => {
    vi.mocked(service.deleteVendor).mockRejectedValue(
      svcError('VENDOR_NOT_FOUND', 'Vendor not found'),
    );

    await expect(api.deleteVendor({ id: 'nonexistent-id' })).rejects.toThrow('Vendor not found');
  });
});

// =============================================================================
// Bill Endpoints
// =============================================================================

describe('createBill', () => {
  it('creates a bill without line items', async () => {
    const billResponse = { ...mockBill, lineItems: [] };
    vi.mocked(service.createBill).mockResolvedValue(billResponse as never);

    const result = await api.createBill({
      vendorId: mockVendor.id,
      billNumber: 'BILL-001',
      billDate: '2026-01-15',
      dueDate: '2026-02-15',
    });

    expect(service.createBill).toHaveBeenCalledWith(
      {
        vendorId: mockVendor.id,
        billNumber: 'BILL-001',
        billDate: '2026-01-15',
        dueDate: '2026-02-15',
        currency: 'USD',
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    expect(result).toEqual(billResponse);
  });

  it('creates a bill with line items', async () => {
    const billResponse = { ...mockBill, lineItems: [mockLineItem] };
    vi.mocked(service.createBill).mockResolvedValue(billResponse as never);

    const result = await api.createBill({
      vendorId: mockVendor.id,
      billNumber: 'BILL-001',
      billDate: '2026-01-15',
      dueDate: '2026-02-15',
      lineItems: [
        {
          description: 'Widget',
          quantity: '10',
          unitPrice: '10.00',
          amount: '100.00',
          taxRate: '10',
          taxAmount: '10.00',
        },
      ],
    });

    expect(service.createBill).toHaveBeenCalled();
    expect(result).toEqual(billResponse);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      api.createBill({
        vendorId: mockVendor.id,
        billNumber: 'BILL-001',
        billDate: '2026-01-15',
        dueDate: '2026-02-15',
      }),
    ).rejects.toThrow('not authenticated');
  });

  it('throws validation_error for invalid vendorId UUID', async () => {
    await expect(
      api.createBill({
        vendorId: 'not-a-uuid',
        billNumber: 'BILL-001',
        billDate: '2026-01-15',
        dueDate: '2026-02-15',
      }),
    ).rejects.toThrow('Invalid request');
  });

  it('propagates VendorNotFoundError from service', async () => {
    vi.mocked(service.createBill).mockRejectedValue(
      svcError('VENDOR_NOT_FOUND', 'Vendor not found'),
    );

    await expect(
      api.createBill({
        vendorId: mockVendor.id,
        billNumber: 'BILL-001',
        billDate: '2026-01-15',
        dueDate: '2026-02-15',
      }),
    ).rejects.toThrow('Vendor not found');
  });
});

describe('getBill', () => {
  it('returns a bill with line items and payments', async () => {
    const billResponse = {
      ...mockBill,
      lineItems: [mockLineItem],
      payments: [mockPayment],
      totalPaid: '110.00',
      outstandingAmount: '0.00',
    };
    vi.mocked(service.getBill).mockResolvedValue(billResponse as never);

    const result = await api.getBill({ id: mockBill.id });

    expect(service.getBill).toHaveBeenCalledWith(mockBill.id, TEST_TENANT_ID);
    expect(result).toEqual(billResponse);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.getBill({ id: mockBill.id })).rejects.toThrow('not authenticated');
  });

  it('propagates BillNotFoundError from service', async () => {
    vi.mocked(service.getBill).mockRejectedValue(
      svcError('BILL_NOT_FOUND', 'Bill not found'),
    );

    await expect(api.getBill({ id: 'nonexistent-id' })).rejects.toThrow('Bill not found');
  });
});

describe('listBills', () => {
  it('lists bills with default pagination', async () => {
    const listResult = { data: [mockBill], total: 1, page: 1, limit: 20 };
    vi.mocked(service.listBills).mockResolvedValue(listResult as never);

    const result = await api.listBills({});

    expect(service.listBills).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      status: undefined,
      vendorId: undefined,
    });
    expect(result).toEqual(listResult);
  });

  it('lists bills with status and vendorId filters', async () => {
    const listResult = { data: [mockBill], total: 1, page: 1, limit: 10 };
    vi.mocked(service.listBills).mockResolvedValue(listResult as never);

    const result = await api.listBills({
      page: 1,
      limit: 10,
      status: 'draft',
      vendorId: mockVendor.id,
    });

    expect(service.listBills).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 10,
      status: 'draft',
      vendorId: mockVendor.id,
    });
    expect(result).toEqual(listResult);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.listBills({})).rejects.toThrow('not authenticated');
  });
});

describe('updateBill', () => {
  it('updates a draft bill', async () => {
    const updated = { ...mockBill, billNumber: 'BILL-002', lineItems: [] };
    vi.mocked(service.updateBill).mockResolvedValue(updated as never);

    const result = await api.updateBill({ id: mockBill.id, billNumber: 'BILL-002' });

    expect(service.updateBill).toHaveBeenCalledWith(
      mockBill.id,
      { billNumber: 'BILL-002' },
      TEST_TENANT_ID,
    );
    expect(result).toEqual(updated);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      api.updateBill({ id: mockBill.id, billNumber: 'BILL-002' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates BillNotFoundError from service', async () => {
    vi.mocked(service.updateBill).mockRejectedValue(
      svcError('BILL_NOT_FOUND', 'Bill not found'),
    );

    await expect(
      api.updateBill({ id: 'nonexistent-id', billNumber: 'BILL-002' }),
    ).rejects.toThrow('Bill not found');
  });

  it('propagates BillInvalidStatusTransitionError for non-draft bills', async () => {
    vi.mocked(service.updateBill).mockRejectedValue(
      svcError('BILL_INVALID_STATUS_TRANSITION', 'Cannot update non-draft bill'),
    );

    await expect(
      api.updateBill({ id: mockBill.id, billNumber: 'BILL-002' }),
    ).rejects.toThrow('Cannot update non-draft bill');
  });
});

describe('deleteBill', () => {
  it('soft-deletes a draft bill', async () => {
    vi.mocked(service.deleteBill).mockResolvedValue(undefined);

    await api.deleteBill({ id: mockBill.id });

    expect(service.deleteBill).toHaveBeenCalledWith(mockBill.id, TEST_TENANT_ID);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.deleteBill({ id: mockBill.id })).rejects.toThrow('not authenticated');
  });

  it('propagates BillNotFoundError from service', async () => {
    vi.mocked(service.deleteBill).mockRejectedValue(
      svcError('BILL_NOT_FOUND', 'Bill not found'),
    );

    await expect(api.deleteBill({ id: 'nonexistent-id' })).rejects.toThrow('Bill not found');
  });

  it('propagates BillInvalidStatusTransitionError for non-draft bills', async () => {
    vi.mocked(service.deleteBill).mockRejectedValue(
      svcError('BILL_INVALID_STATUS_TRANSITION', 'Cannot delete non-draft bill'),
    );

    await expect(api.deleteBill({ id: mockBill.id })).rejects.toThrow('Cannot delete non-draft bill');
  });
});

// =============================================================================
// Bill Actions
// =============================================================================

describe('submitBillForApproval', () => {
  it('submits a draft bill for approval', async () => {
    const submitted = { ...mockBill, status: 'pending_approval' as const, lineItems: [] };
    vi.mocked(service.submitBillForApproval).mockResolvedValue(submitted as never);

    const result = await api.submitBillForApproval({ id: mockBill.id });

    expect(service.submitBillForApproval).toHaveBeenCalledWith(mockBill.id, TEST_TENANT_ID);
    expect(result).toEqual(submitted);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.submitBillForApproval({ id: mockBill.id })).rejects.toThrow(
      'not authenticated',
    );
  });

  it('propagates BillNotFoundError from service', async () => {
    vi.mocked(service.submitBillForApproval).mockRejectedValue(
      svcError('BILL_NOT_FOUND', 'Bill not found'),
    );

    await expect(api.submitBillForApproval({ id: 'nonexistent-id' })).rejects.toThrow('Bill not found');
  });

  it('propagates invalid status transition error', async () => {
    vi.mocked(service.submitBillForApproval).mockRejectedValue(
      svcError('BILL_INVALID_STATUS_TRANSITION', 'Cannot transition from paid to pending_approval'),
    );

    await expect(api.submitBillForApproval({ id: mockBill.id })).rejects.toThrow(
      'Cannot transition',
    );
  });
});

describe('approveBill', () => {
  it('approves a pending bill', async () => {
    const approved = { ...mockBill, status: 'approved' as const, lineItems: [] };
    vi.mocked(service.approveBill).mockResolvedValue(approved as never);

    const result = await api.approveBill({ id: mockBill.id });

    expect(service.approveBill).toHaveBeenCalledWith(mockBill.id, TEST_TENANT_ID);
    expect(result).toEqual(approved);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.approveBill({ id: mockBill.id })).rejects.toThrow('not authenticated');
  });

  it('propagates BillNotFoundError from service', async () => {
    vi.mocked(service.approveBill).mockRejectedValue(
      svcError('BILL_NOT_FOUND', 'Bill not found'),
    );

    await expect(api.approveBill({ id: 'nonexistent-id' })).rejects.toThrow('Bill not found');
  });

  it('propagates BillNotApprovableError for non-pending bills', async () => {
    vi.mocked(service.approveBill).mockRejectedValue(
      svcError('BILL_NOT_APPROVABLE', 'Bill with status "draft" cannot be approved'),
    );

    await expect(api.approveBill({ id: mockBill.id })).rejects.toThrow('cannot be approved');
  });
});

describe('voidBill', () => {
  it('voids a bill', async () => {
    const voided = { ...mockBill, status: 'voided' as const, lineItems: [] };
    vi.mocked(service.voidBill).mockResolvedValue(voided as never);

    const result = await api.voidBill({ id: mockBill.id });

    expect(service.voidBill).toHaveBeenCalledWith(mockBill.id, TEST_TENANT_ID);
    expect(result).toEqual(voided);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.voidBill({ id: mockBill.id })).rejects.toThrow('not authenticated');
  });

  it('propagates BillNotFoundError from service', async () => {
    vi.mocked(service.voidBill).mockRejectedValue(
      svcError('BILL_NOT_FOUND', 'Bill not found'),
    );

    await expect(api.voidBill({ id: 'nonexistent-id' })).rejects.toThrow('Bill not found');
  });

  it('propagates BillAlreadyVoidedError for already voided bills', async () => {
    vi.mocked(service.voidBill).mockRejectedValue(
      svcError('BILL_ALREADY_VOIDED', 'Bill is already voided'),
    );

    await expect(api.voidBill({ id: mockBill.id })).rejects.toThrow('already voided');
  });
});

// =============================================================================
// Bill Line Item Endpoints
// =============================================================================

describe('listBillLineItems', () => {
  it('returns line items for a bill', async () => {
    vi.mocked(service.getBill).mockResolvedValue({ ...mockBill, lineItems: [] } as never);
    vi.mocked(billLineItemRepo.findByBillId).mockResolvedValue([mockLineItem] as never);

    const result = await api.listBillLineItems({ billId: mockBill.id });

    expect(service.getBill).toHaveBeenCalledWith(mockBill.id, TEST_TENANT_ID);
    expect(billLineItemRepo.findByBillId).toHaveBeenCalledWith(mockBill.id);
    expect(result).toEqual([mockLineItem]);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.listBillLineItems({ billId: mockBill.id })).rejects.toThrow(
      'not authenticated',
    );
  });
});

describe('addBillLineItem', () => {
  it('adds a line item to a draft bill', async () => {
    vi.mocked(service.addBillLineItem).mockResolvedValue(mockLineItem as never);

    const result = await api.addBillLineItem({
      billId: mockBill.id,
      description: 'Widget',
      quantity: '10',
      unitPrice: '10.00',
      amount: '100.00',
    });

    expect(service.addBillLineItem).toHaveBeenCalledWith(
      mockBill.id,
      {
        description: 'Widget',
        quantity: '10',
        unitPrice: '10.00',
        amount: '100.00',
      },
      TEST_TENANT_ID,
    );
    expect(result).toEqual(mockLineItem);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      api.addBillLineItem({ billId: mockBill.id, description: 'Widget' }),
    ).rejects.toThrow('not authenticated');
  });

  it('throws validation_error when description is empty', async () => {
    await expect(
      api.addBillLineItem({ billId: mockBill.id, description: '' }),
    ).rejects.toThrow('Invalid request');
  });

  it('propagates BillNotFoundError from service', async () => {
    vi.mocked(service.addBillLineItem).mockRejectedValue(
      svcError('BILL_NOT_FOUND', 'Bill not found'),
    );

    await expect(
      api.addBillLineItem({ billId: 'nonexistent-id', description: 'Widget' }),
    ).rejects.toThrow('Bill not found');
  });
});

describe('updateBillLineItem', () => {
  it('updates a line item on a draft bill', async () => {
    const updated = { ...mockLineItem, description: 'Updated Widget' };
    vi.mocked(service.updateBillLineItem).mockResolvedValue(updated as never);

    const result = await api.updateBillLineItem({
      billId: mockBill.id,
      lineItemId: mockLineItem.id,
      description: 'Updated Widget',
    });

    expect(service.updateBillLineItem).toHaveBeenCalledWith(
      mockLineItem.id,
      { description: 'Updated Widget' },
      mockBill.id,
      TEST_TENANT_ID,
    );
    expect(result).toEqual(updated);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      api.updateBillLineItem({
        billId: mockBill.id,
        lineItemId: mockLineItem.id,
        description: 'Updated Widget',
      }),
    ).rejects.toThrow('not authenticated');
  });

  it('throws validation_error when description is empty string', async () => {
    await expect(
      api.updateBillLineItem({
        billId: mockBill.id,
        lineItemId: mockLineItem.id,
        description: '',
      }),
    ).rejects.toThrow('Invalid request');
  });

  it('propagates BillNotFoundError from service', async () => {
    vi.mocked(service.updateBillLineItem).mockRejectedValue(
      svcError('BILL_NOT_FOUND', 'Bill not found'),
    );

    await expect(
      api.updateBillLineItem({
        billId: 'nonexistent-id',
        lineItemId: mockLineItem.id,
        description: 'Updated Widget',
      }),
    ).rejects.toThrow('Bill not found');
  });
});

describe('deleteBillLineItem', () => {
  it('deletes a line item from a draft bill', async () => {
    vi.mocked(service.deleteBillLineItem).mockResolvedValue(undefined);

    await api.deleteBillLineItem({
      billId: mockBill.id,
      lineItemId: mockLineItem.id,
    });

    expect(service.deleteBillLineItem).toHaveBeenCalledWith(
      mockLineItem.id,
      mockBill.id,
      TEST_TENANT_ID,
    );
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      api.deleteBillLineItem({ billId: mockBill.id, lineItemId: mockLineItem.id }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates BillNotFoundError from service', async () => {
    vi.mocked(service.deleteBillLineItem).mockRejectedValue(
      svcError('BILL_NOT_FOUND', 'Bill not found'),
    );

    await expect(
      api.deleteBillLineItem({ billId: 'nonexistent-id', lineItemId: mockLineItem.id }),
    ).rejects.toThrow('Bill not found');
  });
});

// =============================================================================
// Vendor Payment Endpoints
// =============================================================================

describe('createVendorPayment', () => {
  it('creates a vendor payment', async () => {
    vi.mocked(service.createVendorPayment).mockResolvedValue(mockPayment as never);

    const result = await api.createVendorPayment({
      vendorId: mockVendor.id,
      billId: mockBill.id,
      amount: '110.00',
      paymentDate: '2026-02-01',
      paymentMethod: 'bank_transfer',
    });

    expect(service.createVendorPayment).toHaveBeenCalledWith(
      {
        vendorId: mockVendor.id,
        billId: mockBill.id,
        amount: '110.00',
        paymentDate: '2026-02-01',
        paymentMethod: 'bank_transfer',
        currency: 'USD',
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    expect(result).toEqual(mockPayment);
  });

  it('creates a vendor payment without a linked bill', async () => {
    const unlinkedPayment = { ...mockPayment, billId: null };
    vi.mocked(service.createVendorPayment).mockResolvedValue(unlinkedPayment as never);

    const result = await api.createVendorPayment({
      vendorId: mockVendor.id,
      amount: '50.00',
      paymentDate: '2026-02-01',
      paymentMethod: 'cash',
    });

    expect(service.createVendorPayment).toHaveBeenCalledWith(
      {
        vendorId: mockVendor.id,
        amount: '50.00',
        paymentDate: '2026-02-01',
        paymentMethod: 'cash',
        currency: 'USD',
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    expect(result).toEqual(unlinkedPayment);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      api.createVendorPayment({
        vendorId: mockVendor.id,
        amount: '110.00',
        paymentDate: '2026-02-01',
        paymentMethod: 'bank_transfer',
      }),
    ).rejects.toThrow('not authenticated');
  });

  it('throws validation_error for invalid vendorId UUID', async () => {
    await expect(
      api.createVendorPayment({
        vendorId: 'not-a-uuid',
        amount: '110.00',
        paymentDate: '2026-02-01',
        paymentMethod: 'bank_transfer',
      }),
    ).rejects.toThrow('Invalid request');
  });

  it('propagates VendorNotFoundError from service', async () => {
    vi.mocked(service.createVendorPayment).mockRejectedValue(
      svcError('VENDOR_NOT_FOUND', 'Vendor not found'),
    );

    await expect(
      api.createVendorPayment({
        vendorId: mockVendor.id,
        amount: '110.00',
        paymentDate: '2026-02-01',
        paymentMethod: 'bank_transfer',
      }),
    ).rejects.toThrow('Vendor not found');
  });
});

describe('getVendorPayment', () => {
  it('returns a vendor payment by id', async () => {
    vi.mocked(service.getVendorPayment).mockResolvedValue(mockPayment as never);

    const result = await api.getVendorPayment({ id: mockPayment.id });

    expect(service.getVendorPayment).toHaveBeenCalledWith(mockPayment.id, TEST_TENANT_ID);
    expect(result).toEqual(mockPayment);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.getVendorPayment({ id: mockPayment.id })).rejects.toThrow(
      'not authenticated',
    );
  });

  it('propagates VendorPaymentNotFoundError from service', async () => {
    vi.mocked(service.getVendorPayment).mockRejectedValue(
      svcError('VENDOR_PAYMENT_NOT_FOUND', 'Payment not found'),
    );

    await expect(api.getVendorPayment({ id: 'nonexistent-id' })).rejects.toThrow('Payment not found');
  });
});

describe('listVendorPayments', () => {
  it('lists payments with default pagination', async () => {
    const listResult = { data: [mockPayment], total: 1, page: 1, limit: 20 };
    vi.mocked(service.listVendorPayments).mockResolvedValue(listResult as never);

    const result = await api.listVendorPayments({});

    expect(service.listVendorPayments).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      vendorId: undefined,
      billId: undefined,
    });
    expect(result).toEqual(listResult);
  });

  it('lists payments with vendor and bill filters', async () => {
    const listResult = { data: [mockPayment], total: 1, page: 1, limit: 5 };
    vi.mocked(service.listVendorPayments).mockResolvedValue(listResult as never);

    const result = await api.listVendorPayments({
      page: 1,
      limit: 5,
      vendorId: mockVendor.id,
      billId: mockBill.id,
    });

    expect(service.listVendorPayments).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 5,
      vendorId: mockVendor.id,
      billId: mockBill.id,
    });
    expect(result).toEqual(listResult);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.listVendorPayments({})).rejects.toThrow('not authenticated');
  });
});

describe('deleteVendorPayment', () => {
  it('soft-deletes a vendor payment', async () => {
    vi.mocked(service.deleteVendorPayment).mockResolvedValue(undefined);

    await api.deleteVendorPayment({ id: mockPayment.id });

    expect(service.deleteVendorPayment).toHaveBeenCalledWith(mockPayment.id, TEST_TENANT_ID);
  });

  it('throws unauthenticated when auth is missing', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(api.deleteVendorPayment({ id: mockPayment.id })).rejects.toThrow(
      'not authenticated',
    );
  });

  it('propagates VendorPaymentNotFoundError from service', async () => {
    vi.mocked(service.deleteVendorPayment).mockRejectedValue(
      svcError('VENDOR_PAYMENT_NOT_FOUND', 'Payment not found'),
    );

    await expect(api.deleteVendorPayment({ id: 'nonexistent-id' })).rejects.toThrow('Payment not found');
  });
});
