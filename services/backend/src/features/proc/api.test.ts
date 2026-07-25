import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID, mockSession } from '../../lib/test-utils';

// ─── Mocks ──────────────────────────────────────────────────────────────────

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
vi.mock('~encore/auth', () => ({ getAuthData: () => mockGetAuthData() }));

const { mockService } = vi.hoisted(() => ({
  mockService: {
    createPurchaseOrder: vi.fn(),
    getPurchaseOrder: vi.fn(),
    listPurchaseOrders: vi.fn(),
    updatePurchaseOrder: vi.fn(),
    deletePurchaseOrder: vi.fn(),
    submitPoForApproval: vi.fn(),
    approvePo: vi.fn(),
    cancelPo: vi.fn(),
    closePo: vi.fn(),
    addPoLineItem: vi.fn(),
    updatePoLineItem: vi.fn(),
    deletePoLineItem: vi.fn(),
    createReceivingReport: vi.fn(),
    getReceivingReport: vi.fn(),
    listReceivingReports: vi.fn(),
    updateReceivingReport: vi.fn(),
    confirmReceivingReport: vi.fn(),
    rejectReceivingReport: vi.fn(),
    deleteReceivingReport: vi.fn(),
    createVendorCatalogItem: vi.fn(),
    getVendorCatalogItem: vi.fn(),
    listVendorCatalogItems: vi.fn(),
    updateVendorCatalogItem: vi.fn(),
    deleteVendorCatalogItem: vi.fn(),
  },
}));
vi.mock('./service', () => mockService);

const { mockPoLineItemRepo } = vi.hoisted(() => ({
  mockPoLineItemRepo: { findByPoId: vi.fn() },
}));
vi.mock('./repo', () => ({ poLineItemRepo: mockPoLineItemRepo }));

// ─── Import handlers AFTER mocking ───────────────────────────────────────────

import {
  createPurchaseOrder,
  getPurchaseOrder,
  listPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder,
  submitPoForApproval,
  approvePo,
  cancelPo,
  closePo,
  listPoLineItems,
  addPoLineItem,
  updatePoLineItem,
  deletePoLineItem,
  createReceivingReport,
  getReceivingReport,
  listReceivingReports,
  updateReceivingReport,
  confirmReceivingReport,
  rejectReceivingReport,
  deleteReceivingReport,
  createVendorCatalogItem,
  getVendorCatalogItem,
  listVendorCatalogItems,
  updateVendorCatalogItem,
  deleteVendorCatalogItem,
} from './api';

// ─── Helpers ────────────────────────────────────────────────────────────────

const UUID = '550e8400-e29b-41d4-a716-446655440000';
const UUID2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const UUID3 = '6ba7b811-9dad-11d1-80b5-00c04fd430c8';

function auth(overrides: Record<string, string> = {}) {
  return { ...mockSession, ...overrides };
}

const VALID_PO_CREATE = {
  vendorId: UUID,
  poNumber: 'PO-001',
  orderDate: '2026-01-15',
  shippingAddressLine1: '123 Main St',
  shippingCity: 'Springfield',
  shippingState: 'IL',
  shippingPostalCode: '62701',
  paymentTerms: 'Net 30',
};

const VALID_LINE_ITEM = {
  itemId: UUID2,
  description: 'Widget A',
  quantity: '10',
  unitOfMeasure: 'EA',
  unitPrice: '25.00',
};

const VALID_RR_CREATE = {
  poId: UUID,
  rrNumber: 'RR-001',
  vendorId: UUID,
  receivedDate: '2026-02-01',
  receivedBy: UUID2,
  warehouseId: UUID3,
};

const VALID_VENDOR_CATALOG = {
  vendorId: UUID,
  vendorItemCode: 'VEND-001',
  description: 'Catalog item',
  unitPrice: '15.00',
  unitOfMeasure: 'EA',
  effectiveDate: '2026-01-01',
};

// ─── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthData.mockReturnValue(auth());
});

// =============================================================================
// createPurchaseOrder
// =============================================================================

describe('createPurchaseOrder', () => {
  it('creates a purchase order with valid input', async () => {
    const expected = { id: UUID, ...VALID_PO_CREATE };
    mockService.createPurchaseOrder.mockResolvedValue(expected);

    const result = await createPurchaseOrder(VALID_PO_CREATE);

    expect(result).toEqual(expected);
    expect(mockService.createPurchaseOrder).toHaveBeenCalledWith(
      expect.objectContaining({ vendorId: UUID, poNumber: 'PO-001' }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(createPurchaseOrder(VALID_PO_CREATE)).rejects.toThrow('not authenticated');
  });

  it('validates missing vendorId', async () => {
    const { vendorId: _, ...rest } = VALID_PO_CREATE;

    await expect(createPurchaseOrder(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing poNumber', async () => {
    const { poNumber: _, ...rest } = VALID_PO_CREATE;

    await expect(createPurchaseOrder(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing shippingAddressLine1', async () => {
    const { shippingAddressLine1: _, ...rest } = VALID_PO_CREATE;

    await expect(createPurchaseOrder(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing paymentTerms', async () => {
    const { paymentTerms: _, ...rest } = VALID_PO_CREATE;

    await expect(createPurchaseOrder(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates invalid vendorId format', async () => {
    await expect(
      createPurchaseOrder({ ...VALID_PO_CREATE, vendorId: 'not-a-uuid' }),
    ).rejects.toThrow('Invalid request');
  });

  it('validates missing shippingCity', async () => {
    const { shippingCity: _, ...rest } = VALID_PO_CREATE;

    await expect(createPurchaseOrder(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing shippingState', async () => {
    const { shippingState: _, ...rest } = VALID_PO_CREATE;

    await expect(createPurchaseOrder(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing shippingPostalCode', async () => {
    const { shippingPostalCode: _, ...rest } = VALID_PO_CREATE;

    await expect(createPurchaseOrder(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('passes line items to service when provided', async () => {
    const expected = { id: UUID };
    mockService.createPurchaseOrder.mockResolvedValue(expected);

    await createPurchaseOrder({ ...VALID_PO_CREATE, lineItems: [VALID_LINE_ITEM] });

    expect(mockService.createPurchaseOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        lineItems: [expect.objectContaining({ itemId: UUID2, description: 'Widget A' })],
      }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
  });

  it('propagates service errors', async () => {
    mockService.createPurchaseOrder.mockRejectedValue(new Error('vendor not found'));

    await expect(createPurchaseOrder(VALID_PO_CREATE)).rejects.toThrow('vendor not found');
  });
});

// =============================================================================
// getPurchaseOrder
// =============================================================================

describe('getPurchaseOrder', () => {
  it('returns a purchase order by ID', async () => {
    const expected = { id: UUID };
    mockService.getPurchaseOrder.mockResolvedValue(expected);

    const result = await getPurchaseOrder({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.getPurchaseOrder).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(getPurchaseOrder({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service not_found errors', async () => {
    mockService.getPurchaseOrder.mockRejectedValue(new Error('PO not found'));

    await expect(getPurchaseOrder({ id: UUID })).rejects.toThrow('PO not found');
  });
});

// =============================================================================
// listPurchaseOrders
// =============================================================================

describe('listPurchaseOrders', () => {
  it('lists purchase orders with default pagination', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 20 };
    mockService.listPurchaseOrders.mockResolvedValue(expected);

    const result = await listPurchaseOrders({});

    expect(result).toEqual(expected);
    expect(mockService.listPurchaseOrders).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      status: undefined,
      vendorId: undefined,
    });
  });

  it('passes status and vendorId filters', async () => {
    mockService.listPurchaseOrders.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

    await listPurchaseOrders({ status: 'draft', vendorId: UUID, page: 1, limit: 10 });

    expect(mockService.listPurchaseOrders).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 10,
      status: 'draft',
      vendorId: UUID,
    });
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(listPurchaseOrders({})).rejects.toThrow('not authenticated');
  });

  it('validates invalid vendorId format', async () => {
    await expect(listPurchaseOrders({ vendorId: 'bad-id' })).rejects.toThrow('Invalid request');
  });

  it('validates limit exceeds maximum', async () => {
    await expect(listPurchaseOrders({ limit: 200 })).rejects.toThrow('Invalid request');
  });

  it('validates page must be at least 1', async () => {
    await expect(listPurchaseOrders({ page: 0 })).rejects.toThrow('Invalid request');
  });

  it('propagates service errors', async () => {
    mockService.listPurchaseOrders.mockRejectedValue(new Error('db failure'));

    await expect(listPurchaseOrders({})).rejects.toThrow('db failure');
  });
});

// =============================================================================
// updatePurchaseOrder
// =============================================================================

describe('updatePurchaseOrder', () => {
  it('updates a purchase order with valid input', async () => {
    const expected = { id: UUID, paymentTerms: 'Net 60' };
    mockService.updatePurchaseOrder.mockResolvedValue(expected);

    const result = await updatePurchaseOrder({ id: UUID, paymentTerms: 'Net 60' });

    expect(result).toEqual(expected);
    expect(mockService.updatePurchaseOrder).toHaveBeenCalledWith(
      UUID,
      expect.objectContaining({ paymentTerms: 'Net 60' }),
      TEST_TENANT_ID,
    );
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(updatePurchaseOrder({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('validates invalid vendorId format', async () => {
    await expect(
      updatePurchaseOrder({ id: UUID, vendorId: 'not-a-uuid' }),
    ).rejects.toThrow('Invalid request');
  });

  it('validates invalid currency length', async () => {
    await expect(
      updatePurchaseOrder({ id: UUID, currency: 'USDX' }),
    ).rejects.toThrow('Invalid request');
  });

  it('accepts empty update body', async () => {
    const expected = { id: UUID };
    mockService.updatePurchaseOrder.mockResolvedValue(expected);

    const result = await updatePurchaseOrder({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.updatePurchaseOrder).toHaveBeenCalledWith(UUID, {}, TEST_TENANT_ID);
  });

  it('propagates service errors', async () => {
    mockService.updatePurchaseOrder.mockRejectedValue(new Error('not found'));

    await expect(updatePurchaseOrder({ id: UUID, notes: 'hi' })).rejects.toThrow('not found');
  });
});

// =============================================================================
// deletePurchaseOrder
// =============================================================================

describe('deletePurchaseOrder', () => {
  it('deletes a purchase order', async () => {
    mockService.deletePurchaseOrder.mockResolvedValue(undefined);

    await expect(deletePurchaseOrder({ id: UUID })).resolves.toBeUndefined();
    expect(mockService.deletePurchaseOrder).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(deletePurchaseOrder({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    mockService.deletePurchaseOrder.mockRejectedValue(new Error('cannot delete approved PO'));

    await expect(deletePurchaseOrder({ id: UUID })).rejects.toThrow('cannot delete approved PO');
  });
});

// =============================================================================
// submitPoForApproval
// =============================================================================

describe('submitPoForApproval', () => {
  it('submits a PO for approval', async () => {
    const expected = { id: UUID, status: 'pending_approval' };
    mockService.submitPoForApproval.mockResolvedValue(expected);

    const result = await submitPoForApproval({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.submitPoForApproval).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(submitPoForApproval({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors for non-draft PO', async () => {
    mockService.submitPoForApproval.mockRejectedValue(new Error('PO is not in draft status'));

    await expect(submitPoForApproval({ id: UUID })).rejects.toThrow('PO is not in draft status');
  });
});

// =============================================================================
// approvePo
// =============================================================================

describe('approvePo', () => {
  it('approves a pending PO', async () => {
    const expected = { id: UUID, status: 'approved' };
    mockService.approvePo.mockResolvedValue(expected);

    const result = await approvePo({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.approvePo).toHaveBeenCalledWith(UUID, TEST_TENANT_ID, TEST_USER_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(approvePo({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors for non-pending PO', async () => {
    mockService.approvePo.mockRejectedValue(new Error('PO is not pending approval'));

    await expect(approvePo({ id: UUID })).rejects.toThrow('PO is not pending approval');
  });
});

// =============================================================================
// cancelPo
// =============================================================================

describe('cancelPo', () => {
  it('cancels a PO', async () => {
    const expected = { id: UUID, status: 'cancelled' };
    mockService.cancelPo.mockResolvedValue(expected);

    const result = await cancelPo({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.cancelPo).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(cancelPo({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    mockService.cancelPo.mockRejectedValue(new Error('cannot cancel fully received PO'));

    await expect(cancelPo({ id: UUID })).rejects.toThrow('cannot cancel fully received PO');
  });
});

// =============================================================================
// closePo
// =============================================================================

describe('closePo', () => {
  it('closes a PO', async () => {
    const expected = { id: UUID, status: 'closed' };
    mockService.closePo.mockResolvedValue(expected);

    const result = await closePo({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.closePo).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(closePo({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    mockService.closePo.mockRejectedValue(new Error('PO already closed'));

    await expect(closePo({ id: UUID })).rejects.toThrow('PO already closed');
  });
});

// =============================================================================
// listPoLineItems
// =============================================================================

describe('listPoLineItems', () => {
  it('lists line items for a PO', async () => {
    const po = { id: UUID };
    const lineItems = [{ id: 'li-1' }, { id: 'li-2' }];
    mockService.getPurchaseOrder.mockResolvedValue(po);
    mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);

    const result = await listPoLineItems({ poId: UUID });

    expect(result).toEqual(lineItems);
    expect(mockService.getPurchaseOrder).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
    expect(mockPoLineItemRepo.findByPoId).toHaveBeenCalledWith(UUID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(listPoLineItems({ poId: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates error when PO not found', async () => {
    mockService.getPurchaseOrder.mockRejectedValue(new Error('PO not found'));

    await expect(listPoLineItems({ poId: UUID })).rejects.toThrow('PO not found');
  });

  it('returns empty array when PO has no line items', async () => {
    mockService.getPurchaseOrder.mockResolvedValue({ id: UUID });
    mockPoLineItemRepo.findByPoId.mockResolvedValue([]);

    const result = await listPoLineItems({ poId: UUID });

    expect(result).toEqual([]);
  });
});

// =============================================================================
// addPoLineItem
// =============================================================================

describe('addPoLineItem', () => {
  it('adds a line item to a PO', async () => {
    const expected = { id: 'li-1', ...VALID_LINE_ITEM };
    mockService.addPoLineItem.mockResolvedValue(expected);

    const result = await addPoLineItem({ poId: UUID, ...VALID_LINE_ITEM });

    expect(result).toEqual(expected);
    expect(mockService.addPoLineItem).toHaveBeenCalledWith(
      UUID,
      expect.objectContaining({ itemId: UUID2, description: 'Widget A' }),
      TEST_TENANT_ID,
    );
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(addPoLineItem({ poId: UUID, ...VALID_LINE_ITEM })).rejects.toThrow('not authenticated');
  });

  it('validates missing description', async () => {
    const { description: _, ...rest } = VALID_LINE_ITEM;

    await expect(addPoLineItem({ poId: UUID, ...rest })).rejects.toThrow('Invalid request');
  });

  it('validates missing unitOfMeasure', async () => {
    const { unitOfMeasure: _, ...rest } = VALID_LINE_ITEM;

    await expect(addPoLineItem({ poId: UUID, ...rest })).rejects.toThrow('Invalid request');
  });

  it('validates invalid itemId format', async () => {
    await expect(
      addPoLineItem({ poId: UUID, ...VALID_LINE_ITEM, itemId: 'not-uuid' }),
    ).rejects.toThrow('Invalid request');
  });

  it('propagates service errors', async () => {
    mockService.addPoLineItem.mockRejectedValue(new Error('PO is not in draft status'));

    await expect(addPoLineItem({ poId: UUID, ...VALID_LINE_ITEM })).rejects.toThrow(
      'PO is not in draft status',
    );
  });
});

// =============================================================================
// updatePoLineItem
// =============================================================================

describe('updatePoLineItem', () => {
  it('updates a line item', async () => {
    const expected = { id: 'li-1', description: 'Updated Widget' };
    mockService.updatePoLineItem.mockResolvedValue(expected);

    const result = await updatePoLineItem({
      poId: UUID,
      lineItemId: 'li-1',
      description: 'Updated Widget',
    });

    expect(result).toEqual(expected);
    expect(mockService.updatePoLineItem).toHaveBeenCalledWith(
      'li-1',
      expect.objectContaining({ description: 'Updated Widget' }),
      UUID,
      TEST_TENANT_ID,
    );
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      updatePoLineItem({ poId: UUID, lineItemId: 'li-1', description: 'x' }),
    ).rejects.toThrow('not authenticated');
  });

  it('validates invalid itemId format', async () => {
    await expect(
      updatePoLineItem({ poId: UUID, lineItemId: 'li-1', itemId: 'bad' }),
    ).rejects.toThrow('Invalid request');
  });

  it('accepts empty update body', async () => {
    mockService.updatePoLineItem.mockResolvedValue({ id: 'li-1' });

    const result = await updatePoLineItem({ poId: UUID, lineItemId: 'li-1' });

    expect(result).toEqual({ id: 'li-1' });
    expect(mockService.updatePoLineItem).toHaveBeenCalledWith('li-1', {}, UUID, TEST_TENANT_ID);
  });

  it('propagates service errors', async () => {
    mockService.updatePoLineItem.mockRejectedValue(new Error('line item not found'));

    await expect(
      updatePoLineItem({ poId: UUID, lineItemId: 'li-1', description: 'x' }),
    ).rejects.toThrow('line item not found');
  });
});

// =============================================================================
// deletePoLineItem
// =============================================================================

describe('deletePoLineItem', () => {
  it('deletes a line item', async () => {
    mockService.deletePoLineItem.mockResolvedValue(undefined);

    await expect(deletePoLineItem({ poId: UUID, lineItemId: 'li-1' })).resolves.toBeUndefined();
    expect(mockService.deletePoLineItem).toHaveBeenCalledWith('li-1', UUID, TEST_TENANT_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(deletePoLineItem({ poId: UUID, lineItemId: 'li-1' })).rejects.toThrow(
      'not authenticated',
    );
  });

  it('propagates service errors', async () => {
    mockService.deletePoLineItem.mockRejectedValue(new Error('PO is not in draft status'));

    await expect(deletePoLineItem({ poId: UUID, lineItemId: 'li-1' })).rejects.toThrow(
      'PO is not in draft status',
    );
  });
});

// =============================================================================
// createReceivingReport
// =============================================================================

describe('createReceivingReport', () => {
  it('creates a receiving report with valid input', async () => {
    const expected = { id: UUID, ...VALID_RR_CREATE };
    mockService.createReceivingReport.mockResolvedValue(expected);

    const result = await createReceivingReport(VALID_RR_CREATE);

    expect(result).toEqual(expected);
    expect(mockService.createReceivingReport).toHaveBeenCalledWith(
      expect.objectContaining({ poId: UUID, rrNumber: 'RR-001' }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(createReceivingReport(VALID_RR_CREATE)).rejects.toThrow('not authenticated');
  });

  it('validates missing poId', async () => {
    const { poId: _, ...rest } = VALID_RR_CREATE;

    await expect(createReceivingReport(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing rrNumber', async () => {
    const { rrNumber: _, ...rest } = VALID_RR_CREATE;

    await expect(createReceivingReport(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing vendorId', async () => {
    const { vendorId: _, ...rest } = VALID_RR_CREATE;

    await expect(createReceivingReport(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing receivedDate', async () => {
    const { receivedDate: _, ...rest } = VALID_RR_CREATE;

    await expect(createReceivingReport(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing receivedBy', async () => {
    const { receivedBy: _, ...rest } = VALID_RR_CREATE;

    await expect(createReceivingReport(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing warehouseId', async () => {
    const { warehouseId: _, ...rest } = VALID_RR_CREATE;

    await expect(createReceivingReport(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates invalid poId format', async () => {
    await expect(createReceivingReport({ ...VALID_RR_CREATE, poId: 'bad' })).rejects.toThrow(
      'Invalid request',
    );
  });

  it('validates invalid vendorId format', async () => {
    await expect(createReceivingReport({ ...VALID_RR_CREATE, vendorId: 'bad' })).rejects.toThrow(
      'Invalid request',
    );
  });

  it('propagates service errors', async () => {
    mockService.createReceivingReport.mockRejectedValue(new Error('PO not found'));

    await expect(createReceivingReport(VALID_RR_CREATE)).rejects.toThrow('PO not found');
  });
});

// =============================================================================
// getReceivingReport
// =============================================================================

describe('getReceivingReport', () => {
  it('returns a receiving report by ID', async () => {
    const expected = { id: UUID };
    mockService.getReceivingReport.mockResolvedValue(expected);

    const result = await getReceivingReport({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.getReceivingReport).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(getReceivingReport({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    mockService.getReceivingReport.mockRejectedValue(new Error('not found'));

    await expect(getReceivingReport({ id: UUID })).rejects.toThrow('not found');
  });
});

// =============================================================================
// listReceivingReports
// =============================================================================

describe('listReceivingReports', () => {
  it('lists receiving reports with default pagination', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 20 };
    mockService.listReceivingReports.mockResolvedValue(expected);

    const result = await listReceivingReports({});

    expect(result).toEqual(expected);
    expect(mockService.listReceivingReports).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      status: undefined,
      poId: undefined,
      vendorId: undefined,
    });
  });

  it('passes all filters to service', async () => {
    mockService.listReceivingReports.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

    await listReceivingReports({
      status: 'confirmed',
      poId: UUID,
      vendorId: UUID2,
      page: 2,
      limit: 10,
    });

    expect(mockService.listReceivingReports).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 2,
      limit: 10,
      status: 'confirmed',
      poId: UUID,
      vendorId: UUID2,
    });
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(listReceivingReports({})).rejects.toThrow('not authenticated');
  });

  it('validates invalid poId format', async () => {
    await expect(listReceivingReports({ poId: 'bad' })).rejects.toThrow('Invalid request');
  });

  it('validates invalid vendorId format', async () => {
    await expect(listReceivingReports({ vendorId: 'bad' })).rejects.toThrow('Invalid request');
  });

  it('validates limit exceeds maximum', async () => {
    await expect(listReceivingReports({ limit: 101 })).rejects.toThrow('Invalid request');
  });

  it('propagates service errors', async () => {
    mockService.listReceivingReports.mockRejectedValue(new Error('db error'));

    await expect(listReceivingReports({})).rejects.toThrow('db error');
  });
});

// =============================================================================
// updateReceivingReport
// =============================================================================

describe('updateReceivingReport', () => {
  it('updates a receiving report', async () => {
    const expected = { id: UUID, notes: 'updated' };
    mockService.updateReceivingReport.mockResolvedValue(expected);

    const result = await updateReceivingReport({ id: UUID, notes: 'updated' });

    expect(result).toEqual(expected);
    expect(mockService.updateReceivingReport).toHaveBeenCalledWith(
      UUID,
      expect.objectContaining({ notes: 'updated' }),
      TEST_TENANT_ID,
    );
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(updateReceivingReport({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('accepts empty update body', async () => {
    mockService.updateReceivingReport.mockResolvedValue({ id: UUID });

    const result = await updateReceivingReport({ id: UUID });

    expect(result).toEqual({ id: UUID });
    expect(mockService.updateReceivingReport).toHaveBeenCalledWith(UUID, {}, TEST_TENANT_ID);
  });

  it('propagates service errors', async () => {
    mockService.updateReceivingReport.mockRejectedValue(new Error('already confirmed'));

    await expect(updateReceivingReport({ id: UUID, notes: 'x' })).rejects.toThrow(
      'already confirmed',
    );
  });
});

// =============================================================================
// confirmReceivingReport
// =============================================================================

describe('confirmReceivingReport', () => {
  it('confirms a receiving report', async () => {
    const expected = { id: UUID, status: 'confirmed' };
    mockService.confirmReceivingReport.mockResolvedValue(expected);

    const result = await confirmReceivingReport({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.confirmReceivingReport).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(confirmReceivingReport({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    mockService.confirmReceivingReport.mockRejectedValue(new Error('already confirmed'));

    await expect(confirmReceivingReport({ id: UUID })).rejects.toThrow('already confirmed');
  });
});

// =============================================================================
// rejectReceivingReport
// =============================================================================

describe('rejectReceivingReport', () => {
  it('rejects a receiving report', async () => {
    const expected = { id: UUID, status: 'rejected' };
    mockService.rejectReceivingReport.mockResolvedValue(expected);

    const result = await rejectReceivingReport({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.rejectReceivingReport).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(rejectReceivingReport({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    mockService.rejectReceivingReport.mockRejectedValue(new Error('already rejected'));

    await expect(rejectReceivingReport({ id: UUID })).rejects.toThrow('already rejected');
  });
});

// =============================================================================
// deleteReceivingReport
// =============================================================================

describe('deleteReceivingReport', () => {
  it('deletes a receiving report', async () => {
    mockService.deleteReceivingReport.mockResolvedValue(undefined);

    await expect(deleteReceivingReport({ id: UUID })).resolves.toBeUndefined();
    expect(mockService.deleteReceivingReport).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(deleteReceivingReport({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    mockService.deleteReceivingReport.mockRejectedValue(new Error('cannot delete confirmed'));

    await expect(deleteReceivingReport({ id: UUID })).rejects.toThrow('cannot delete confirmed');
  });
});

// =============================================================================
// createVendorCatalogItem
// =============================================================================

describe('createVendorCatalogItem', () => {
  it('creates a vendor catalog item with valid input', async () => {
    const expected = { id: UUID, ...VALID_VENDOR_CATALOG };
    mockService.createVendorCatalogItem.mockResolvedValue(expected);

    const result = await createVendorCatalogItem(VALID_VENDOR_CATALOG);

    expect(result).toEqual(expected);
    expect(mockService.createVendorCatalogItem).toHaveBeenCalledWith(
      expect.objectContaining({ vendorId: UUID, vendorItemCode: 'VEND-001' }),
    );
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(createVendorCatalogItem(VALID_VENDOR_CATALOG)).rejects.toThrow('not authenticated');
  });

  it('validates missing vendorId', async () => {
    const { vendorId: _, ...rest } = VALID_VENDOR_CATALOG;

    await expect(createVendorCatalogItem(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing vendorItemCode', async () => {
    const { vendorItemCode: _, ...rest } = VALID_VENDOR_CATALOG;

    await expect(createVendorCatalogItem(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing description', async () => {
    const { description: _, ...rest } = VALID_VENDOR_CATALOG;

    await expect(createVendorCatalogItem(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing unitOfMeasure', async () => {
    const { unitOfMeasure: _, ...rest } = VALID_VENDOR_CATALOG;

    await expect(createVendorCatalogItem(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates missing effectiveDate', async () => {
    const { effectiveDate: _, ...rest } = VALID_VENDOR_CATALOG;

    await expect(createVendorCatalogItem(rest as Record<string, unknown>)).rejects.toThrow('Invalid request');
  });

  it('validates invalid vendorId format', async () => {
    await expect(
      createVendorCatalogItem({ ...VALID_VENDOR_CATALOG, vendorId: 'bad' }),
    ).rejects.toThrow('Invalid request');
  });

  it('validates invalid currency length', async () => {
    await expect(
      createVendorCatalogItem({ ...VALID_VENDOR_CATALOG, currency: 'USDX' }),
    ).rejects.toThrow('Invalid request');
  });

  it('propagates service errors', async () => {
    mockService.createVendorCatalogItem.mockRejectedValue(new Error('vendor not found'));

    await expect(createVendorCatalogItem(VALID_VENDOR_CATALOG)).rejects.toThrow('vendor not found');
  });
});

// =============================================================================
// getVendorCatalogItem
// =============================================================================

describe('getVendorCatalogItem', () => {
  it('returns a vendor catalog item by ID', async () => {
    const expected = { id: UUID };
    mockService.getVendorCatalogItem.mockResolvedValue(expected);

    const result = await getVendorCatalogItem({ id: UUID });

    expect(result).toEqual(expected);
    expect(mockService.getVendorCatalogItem).toHaveBeenCalledWith(UUID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(getVendorCatalogItem({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    mockService.getVendorCatalogItem.mockRejectedValue(new Error('not found'));

    await expect(getVendorCatalogItem({ id: UUID })).rejects.toThrow('not found');
  });
});

// =============================================================================
// listVendorCatalogItems
// =============================================================================

describe('listVendorCatalogItems', () => {
  it('lists vendor catalog items with default pagination', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 20 };
    mockService.listVendorCatalogItems.mockResolvedValue(expected);

    const result = await listVendorCatalogItems({});

    expect(result).toEqual(expected);
    expect(mockService.listVendorCatalogItems).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      vendorId: undefined,
    });
  });

  it('passes vendorId filter', async () => {
    mockService.listVendorCatalogItems.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

    await listVendorCatalogItems({ vendorId: UUID, page: 2, limit: 10 });

    expect(mockService.listVendorCatalogItems).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      vendorId: UUID,
    });
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(listVendorCatalogItems({})).rejects.toThrow('not authenticated');
  });

  it('validates invalid vendorId format', async () => {
    await expect(listVendorCatalogItems({ vendorId: 'bad' })).rejects.toThrow('Invalid request');
  });

  it('validates limit exceeds maximum', async () => {
    await expect(listVendorCatalogItems({ limit: 101 })).rejects.toThrow('Invalid request');
  });

  it('validates page must be at least 1', async () => {
    await expect(listVendorCatalogItems({ page: 0 })).rejects.toThrow('Invalid request');
  });

  it('propagates service errors', async () => {
    mockService.listVendorCatalogItems.mockRejectedValue(new Error('db failure'));

    await expect(listVendorCatalogItems({})).rejects.toThrow('db failure');
  });
});

// =============================================================================
// updateVendorCatalogItem
// =============================================================================

describe('updateVendorCatalogItem', () => {
  it('updates a vendor catalog item', async () => {
    const expected = { id: UUID, description: 'Updated' };
    mockService.updateVendorCatalogItem.mockResolvedValue(expected);

    const result = await updateVendorCatalogItem({ id: UUID, description: 'Updated' });

    expect(result).toEqual(expected);
    expect(mockService.updateVendorCatalogItem).toHaveBeenCalledWith(
      UUID,
      expect.objectContaining({ description: 'Updated' }),
    );
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(updateVendorCatalogItem({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('validates invalid currency length', async () => {
    await expect(
      updateVendorCatalogItem({ id: UUID, currency: 'USDX' }),
    ).rejects.toThrow('Invalid request');
  });

  it('validates invalid internalItemId format', async () => {
    await expect(
      updateVendorCatalogItem({ id: UUID, internalItemId: 'bad' }),
    ).rejects.toThrow('Invalid request');
  });

  it('accepts empty update body', async () => {
    mockService.updateVendorCatalogItem.mockResolvedValue({ id: UUID });

    const result = await updateVendorCatalogItem({ id: UUID });

    expect(result).toEqual({ id: UUID });
    expect(mockService.updateVendorCatalogItem).toHaveBeenCalledWith(UUID, {});
  });

  it('propagates service errors', async () => {
    mockService.updateVendorCatalogItem.mockRejectedValue(new Error('not found'));

    await expect(updateVendorCatalogItem({ id: UUID, description: 'x' })).rejects.toThrow(
      'not found',
    );
  });
});

// =============================================================================
// deleteVendorCatalogItem
// =============================================================================

describe('deleteVendorCatalogItem', () => {
  it('deletes a vendor catalog item', async () => {
    mockService.deleteVendorCatalogItem.mockResolvedValue(undefined);

    await expect(deleteVendorCatalogItem({ id: UUID })).resolves.toBeUndefined();
    expect(mockService.deleteVendorCatalogItem).toHaveBeenCalledWith(UUID);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(deleteVendorCatalogItem({ id: UUID })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    mockService.deleteVendorCatalogItem.mockRejectedValue(new Error('not found'));

    await expect(deleteVendorCatalogItem({ id: UUID })).rejects.toThrow('not found');
  });
});
