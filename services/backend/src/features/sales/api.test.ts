import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TEST_TENANT_ID } from '../../lib/test-utils';

vi.mock('encore.dev/api', () => {
  class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
    static unauthenticated(message: string) {
      return new MockAPIError('UNAUTHENTICATED', message, { status: 401 });
    }
    static notFound(message: string) {
      return new MockAPIError('NOT_FOUND', message, { status: 404 });
    }
    static invalidArgument(message: string) {
      return new MockAPIError('INVALID_ARGUMENT', message, { status: 400 });
    }
  }
  return {
    APIError: MockAPIError,
    api: vi.fn((_config: unknown, handler: unknown) => handler),
  };
});

vi.mock('~encore/auth', () => ({
  getAuthData: vi.fn(),
}));

vi.mock('./service', () => ({
  listSalesOrders: vi.fn(),
  getSalesOrder: vi.fn(),
  getSalesOrderLineItems: vi.fn(),
  createSalesOrder: vi.fn(),
  updateSalesOrder: vi.fn(),
  updateSalesOrderStatus: vi.fn(),
  deleteSalesOrder: vi.fn(),
  createSalesOrderLineItem: vi.fn(),
  updateSalesOrderLineItem: vi.fn(),
  deleteSalesOrderLineItem: vi.fn(),
  listQuotations: vi.fn(),
  getQuotation: vi.fn(),
  getQuotationLineItems: vi.fn(),
  createQuotation: vi.fn(),
  updateQuotation: vi.fn(),
  updateQuotationStatus: vi.fn(),
  deleteQuotation: vi.fn(),
  createQuotationLineItem: vi.fn(),
  updateQuotationLineItem: vi.fn(),
  deleteQuotationLineItem: vi.fn(),
  listDiscountPolicies: vi.fn(),
  getDiscountPolicy: vi.fn(),
  createDiscountPolicy: vi.fn(),
  updateDiscountPolicy: vi.fn(),
  deleteDiscountPolicy: vi.fn(),
}));

import { getAuthData } from '~encore/auth';
import * as service from './service';
import {
  listSalesOrders,
  getSalesOrder,
  getSalesOrderLineItems,
  createSalesOrder,
  updateSalesOrder,
  updateSalesOrderStatus,
  deleteSalesOrder,
  createSalesOrderLineItem,
  updateSalesOrderLineItem,
  deleteSalesOrderLineItem,
  listQuotations,
  getQuotation,
  getQuotationLineItems,
  createQuotation,
  updateQuotation,
  updateQuotationStatus,
  deleteQuotation,
  createQuotationLineItem,
  updateQuotationLineItem,
  deleteQuotationLineItem,
  listDiscountPolicies,
  getDiscountPolicy,
  createDiscountPolicy,
  updateDiscountPolicy,
  deleteDiscountPolicy,
} from './api';

const mockGetAuthData = vi.mocked(getAuthData);

const mockAuth = { tenantId: TEST_TENANT_ID };

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_UUID_2 = '660e8400-e29b-41d4-a716-446655440001';
const VALID_UUID_3 = '770e8400-e29b-41d4-a716-446655440002';

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthData.mockReturnValue(mockAuth);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Sales Order Tests ──────────────────────────────────────────────────────

describe('listSalesOrders', () => {
  it('returns paginated sales orders', async () => {
    const result = { data: [], total: 0, limit: 50, offset: 0 };
    vi.mocked(service.listSalesOrders).mockResolvedValue(result);

    const res = await (listSalesOrders as Function)({
      customerId: VALID_UUID,
      status: 'draft',
      limit: 10,
      offset: 5,
    });

    expect(service.listSalesOrders).toHaveBeenCalledWith(TEST_TENANT_ID, {
      customerId: VALID_UUID,
      status: 'draft',
      limit: 10,
      offset: 5,
    });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listSalesOrders).mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

    await (listSalesOrders as Function)({});

    expect(service.listSalesOrders).toHaveBeenCalledWith(TEST_TENANT_ID, {
      customerId: undefined,
      status: undefined,
      limit: 50,
      offset: 0,
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listSalesOrders as Function)({})).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.listSalesOrders).mockRejectedValue(new Error('db failure'));

    await expect((listSalesOrders as Function)({})).rejects.toThrow('db failure');
  });
});

describe('getSalesOrder', () => {
  it('returns a sales order by id', async () => {
    const order = { id: 'so-1', orderNumber: 'SO-001' };
    vi.mocked(service.getSalesOrder).mockResolvedValue(order);

    const res = await (getSalesOrder as Function)({ id: 'so-1' });

    expect(service.getSalesOrder).toHaveBeenCalledWith('so-1', TEST_TENANT_ID);
    expect(res).toEqual(order);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getSalesOrder as Function)({ id: 'so-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getSalesOrder).mockRejectedValue(new Error('not found'));

    await expect((getSalesOrder as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('getSalesOrderLineItems', () => {
  it('returns line items for a sales order', async () => {
    const items = [{ id: 'li-1', description: 'Widget' }];
    vi.mocked(service.getSalesOrderLineItems).mockResolvedValue(items);

    const res = await (getSalesOrderLineItems as Function)({ id: 'so-1' });

    expect(service.getSalesOrderLineItems).toHaveBeenCalledWith('so-1', TEST_TENANT_ID);
    expect(res).toEqual(items);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (getSalesOrderLineItems as Function)({ id: 'so-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getSalesOrderLineItems).mockRejectedValue(new Error('order not found'));

    await expect((getSalesOrderLineItems as Function)({ id: 'bad' })).rejects.toThrow('order not found');
  });
});

describe('createSalesOrder', () => {
  const validCreatePayload = {
    orderNumber: 'SO-001',
    customerId: VALID_UUID,
    orderDate: '2026-01-15',
    currency: 'USD',
    lineItems: [
      { itemId: VALID_UUID_2, quantity: '10', unitPrice: '25.00' },
    ],
  };

  it('creates a sales order with valid data', async () => {
    const order = { id: 'so-1', orderNumber: 'SO-001' };
    vi.mocked(service.createSalesOrder).mockResolvedValue(order);

    const res = await (createSalesOrder as Function)(validCreatePayload);

    expect(service.createSalesOrder).toHaveBeenCalled();
    expect(res).toEqual(order);
  });

  it('rejects missing orderNumber', async () => {
    await expect(
      (createSalesOrder as Function)({
        customerId: VALID_UUID,
        orderDate: '2026-01-15',
        lineItems: [{ itemId: VALID_UUID_2, quantity: '1', unitPrice: '10' }],
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid customerId uuid', async () => {
    await expect(
      (createSalesOrder as Function)({
        orderNumber: 'SO-001',
        customerId: 'not-a-uuid',
        orderDate: '2026-01-15',
        lineItems: [{ itemId: VALID_UUID_2, quantity: '1', unitPrice: '10' }],
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid orderDate format', async () => {
    await expect(
      (createSalesOrder as Function)({
        orderNumber: 'SO-001',
        customerId: VALID_UUID,
        orderDate: '01-15-2026',
        lineItems: [{ itemId: VALID_UUID_2, quantity: '1', unitPrice: '10' }],
      }),
    ).rejects.toThrow();
  });

  it('rejects empty lineItems array', async () => {
    await expect(
      (createSalesOrder as Function)({
        orderNumber: 'SO-001',
        customerId: VALID_UUID,
        orderDate: '2026-01-15',
        lineItems: [],
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid lineItem itemId uuid', async () => {
    await expect(
      (createSalesOrder as Function)({
        orderNumber: 'SO-001',
        customerId: VALID_UUID,
        orderDate: '2026-01-15',
        lineItems: [{ itemId: 'not-a-uuid', quantity: '1', unitPrice: '10' }],
      }),
    ).rejects.toThrow();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (createSalesOrder as Function)(validCreatePayload),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createSalesOrder).mockRejectedValue(new Error('duplicate order number'));

    await expect(
      (createSalesOrder as Function)(validCreatePayload),
    ).rejects.toThrow('duplicate order number');
  });

  it('creates with optional fields', async () => {
    const order = { id: 'so-1', orderNumber: 'SO-002' };
    vi.mocked(service.createSalesOrder).mockResolvedValue(order);

    await (createSalesOrder as Function)({
      ...validCreatePayload,
      expectedDeliveryDate: '2026-02-01',
      notes: 'Rush order',
      lineItems: [
        {
          itemId: VALID_UUID_2,
          quantity: '5',
          unitPrice: '100.00',
          description: 'Premium Widget',
          discountPercent: '10',
          taxRate: '0.05',
        },
      ],
    });

    expect(service.createSalesOrder).toHaveBeenCalled();
  });
});

describe('updateSalesOrder', () => {
  it('updates a sales order', async () => {
    const order = { id: 'so-1', orderNumber: 'SO-001' };
    vi.mocked(service.updateSalesOrder).mockResolvedValue(order);

    const res = await (updateSalesOrder as Function)({
      id: 'so-1',
      notes: 'Updated notes',
    });

    expect(service.updateSalesOrder).toHaveBeenCalledWith(
      'so-1',
      { notes: 'Updated notes' },
      TEST_TENANT_ID,
    );
    expect(res).toEqual(order);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (updateSalesOrder as Function)({ id: 'so-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateSalesOrder).mockRejectedValue(new Error('not found'));

    await expect(
      (updateSalesOrder as Function)({ id: 'bad', notes: 'x' }),
    ).rejects.toThrow('not found');
  });

  it('updates with valid line items', async () => {
    const order = { id: 'so-1', orderNumber: 'SO-001' };
    vi.mocked(service.updateSalesOrder).mockResolvedValue(order);

    await (updateSalesOrder as Function)({
      id: 'so-1',
      lineItems: [
        { itemId: VALID_UUID_2, quantity: '20', unitPrice: '50.00' },
      ],
    });

    expect(service.updateSalesOrder).toHaveBeenCalled();
  });
});

describe('updateSalesOrderStatus', () => {
  it('updates sales order status', async () => {
    const order = { id: 'so-1', status: 'confirmed' };
    vi.mocked(service.updateSalesOrderStatus).mockResolvedValue(order);

    const res = await (updateSalesOrderStatus as Function)({ id: 'so-1', status: 'confirmed' });

    expect(service.updateSalesOrderStatus).toHaveBeenCalledWith('so-1', 'confirmed', TEST_TENANT_ID);
    expect(res).toEqual(order);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (updateSalesOrderStatus as Function)({ id: 'so-1', status: 'confirmed' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateSalesOrderStatus).mockRejectedValue(new Error('invalid transition'));

    await expect(
      (updateSalesOrderStatus as Function)({ id: 'so-1', status: 'delivered' }),
    ).rejects.toThrow('invalid transition');
  });
});

describe('deleteSalesOrder', () => {
  it('deletes a sales order', async () => {
    vi.mocked(service.deleteSalesOrder).mockResolvedValue(undefined);

    await (deleteSalesOrder as Function)({ id: 'so-1' });

    expect(service.deleteSalesOrder).toHaveBeenCalledWith('so-1', TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (deleteSalesOrder as Function)({ id: 'so-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.deleteSalesOrder).mockRejectedValue(new Error('cannot delete confirmed order'));

    await expect(
      (deleteSalesOrder as Function)({ id: 'so-1' }),
    ).rejects.toThrow('cannot delete confirmed order');
  });
});

// ─── Sales Order Line Item Tests ────────────────────────────────────────────

describe('createSalesOrderLineItem', () => {
  it('creates a line item for a sales order', async () => {
    const lineItem = { id: 'li-1', itemId: VALID_UUID_2, quantity: '10' };
    vi.mocked(service.createSalesOrderLineItem).mockResolvedValue(lineItem);

    const res = await (createSalesOrderLineItem as Function)({
      orderId: 'so-1',
      itemId: VALID_UUID_2,
      quantity: '10',
      unitPrice: '25.00',
    });

    expect(service.createSalesOrderLineItem).toHaveBeenCalledWith(
      'so-1',
      { itemId: VALID_UUID_2, quantity: '10', unitPrice: '25.00' },
      TEST_TENANT_ID,
    );
    expect(res).toEqual(lineItem);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (createSalesOrderLineItem as Function)({
        orderId: 'so-1',
        itemId: VALID_UUID_2,
        quantity: '10',
        unitPrice: '25.00',
      }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createSalesOrderLineItem).mockRejectedValue(new Error('order not in draft'));

    await expect(
      (createSalesOrderLineItem as Function)({
        orderId: 'so-1',
        itemId: VALID_UUID_2,
        quantity: '10',
        unitPrice: '25.00',
      }),
    ).rejects.toThrow('order not in draft');
  });

  it('creates with optional fields', async () => {
    const lineItem = { id: 'li-1' };
    vi.mocked(service.createSalesOrderLineItem).mockResolvedValue(lineItem);

    await (createSalesOrderLineItem as Function)({
      orderId: 'so-1',
      itemId: VALID_UUID_2,
      quantity: '5',
      unitPrice: '100.00',
      description: 'Premium Widget',
      discountPercent: '10',
      taxRate: '0.05',
    });

    expect(service.createSalesOrderLineItem).toHaveBeenCalled();
  });
});

describe('updateSalesOrderLineItem', () => {
  it('updates a sales order line item', async () => {
    const lineItem = { id: 'li-1', quantity: '20' };
    vi.mocked(service.updateSalesOrderLineItem).mockResolvedValue(lineItem);

    const res = await (updateSalesOrderLineItem as Function)({
      id: 'li-1',
      quantity: '20',
    });

    expect(service.updateSalesOrderLineItem).toHaveBeenCalledWith(
      'li-1',
      { quantity: '20' },
      TEST_TENANT_ID,
    );
    expect(res).toEqual(lineItem);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (updateSalesOrderLineItem as Function)({ id: 'li-1', quantity: '20' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateSalesOrderLineItem).mockRejectedValue(new Error('line item not found'));

    await expect(
      (updateSalesOrderLineItem as Function)({ id: 'bad', quantity: '20' }),
    ).rejects.toThrow('line item not found');
  });

  it('updates with all optional fields', async () => {
    const lineItem = { id: 'li-1' };
    vi.mocked(service.updateSalesOrderLineItem).mockResolvedValue(lineItem);

    await (updateSalesOrderLineItem as Function)({
      id: 'li-1',
      itemId: VALID_UUID_3,
      description: 'Updated description',
      quantity: '15',
      unitPrice: '75.00',
      discountPercent: '5',
      discountAmount: '10.00',
      taxRate: '0.08',
      taxAmount: '5.00',
    });

    expect(service.updateSalesOrderLineItem).toHaveBeenCalled();
  });
});

describe('deleteSalesOrderLineItem', () => {
  it('deletes a sales order line item', async () => {
    vi.mocked(service.deleteSalesOrderLineItem).mockResolvedValue(undefined);

    await (deleteSalesOrderLineItem as Function)({ id: 'li-1' });

    expect(service.deleteSalesOrderLineItem).toHaveBeenCalledWith('li-1', TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (deleteSalesOrderLineItem as Function)({ id: 'li-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.deleteSalesOrderLineItem).mockRejectedValue(new Error('line item not found'));

    await expect(
      (deleteSalesOrderLineItem as Function)({ id: 'bad' }),
    ).rejects.toThrow('line item not found');
  });
});

// ─── Quotation Tests ────────────────────────────────────────────────────────

describe('listQuotations', () => {
  it('returns paginated quotations', async () => {
    const result = { data: [], total: 0, limit: 50, offset: 0 };
    vi.mocked(service.listQuotations).mockResolvedValue(result);

    const res = await (listQuotations as Function)({
      customerId: VALID_UUID,
      status: 'draft',
      limit: 20,
      offset: 10,
    });

    expect(service.listQuotations).toHaveBeenCalledWith(TEST_TENANT_ID, {
      customerId: VALID_UUID,
      status: 'draft',
      limit: 20,
      offset: 10,
    });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listQuotations).mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

    await (listQuotations as Function)({});

    expect(service.listQuotations).toHaveBeenCalledWith(TEST_TENANT_ID, {
      customerId: undefined,
      status: undefined,
      limit: 50,
      offset: 0,
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listQuotations as Function)({})).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.listQuotations).mockRejectedValue(new Error('db error'));

    await expect((listQuotations as Function)({})).rejects.toThrow('db error');
  });
});

describe('getQuotation', () => {
  it('returns a quotation by id', async () => {
    const quotation = { id: 'qt-1', quotationNumber: 'QT-001' };
    vi.mocked(service.getQuotation).mockResolvedValue(quotation);

    const res = await (getQuotation as Function)({ id: 'qt-1' });

    expect(service.getQuotation).toHaveBeenCalledWith('qt-1', TEST_TENANT_ID);
    expect(res).toEqual(quotation);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getQuotation as Function)({ id: 'qt-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getQuotation).mockRejectedValue(new Error('not found'));

    await expect((getQuotation as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('getQuotationLineItems', () => {
  it('returns line items for a quotation', async () => {
    const items = [{ id: 'qli-1', description: 'Service' }];
    vi.mocked(service.getQuotationLineItems).mockResolvedValue(items);

    const res = await (getQuotationLineItems as Function)({ id: 'qt-1' });

    expect(service.getQuotationLineItems).toHaveBeenCalledWith('qt-1', TEST_TENANT_ID);
    expect(res).toEqual(items);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (getQuotationLineItems as Function)({ id: 'qt-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getQuotationLineItems).mockRejectedValue(new Error('quotation not found'));

    await expect((getQuotationLineItems as Function)({ id: 'bad' })).rejects.toThrow('quotation not found');
  });
});

describe('createQuotation', () => {
  const validCreatePayload = {
    quotationNumber: 'QT-001',
    customerId: VALID_UUID,
    issueDate: '2026-01-15',
    expiryDate: '2026-02-15',
    validDays: 30,
    currency: 'USD',
    lineItems: [
      { itemId: VALID_UUID_2, quantity: '5', unitPrice: '100.00' },
    ],
  };

  it('creates a quotation with valid data', async () => {
    const quotation = { id: 'qt-1', quotationNumber: 'QT-001' };
    vi.mocked(service.createQuotation).mockResolvedValue(quotation);

    const res = await (createQuotation as Function)(validCreatePayload);

    expect(service.createQuotation).toHaveBeenCalled();
    expect(res).toEqual(quotation);
  });

  it('rejects missing quotationNumber', async () => {
    await expect(
      (createQuotation as Function)({
        customerId: VALID_UUID,
        issueDate: '2026-01-15',
        expiryDate: '2026-02-15',
        lineItems: [{ itemId: VALID_UUID_2, quantity: '1', unitPrice: '10' }],
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid customerId uuid', async () => {
    await expect(
      (createQuotation as Function)({
        ...validCreatePayload,
        customerId: 'not-a-uuid',
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid issueDate format', async () => {
    await expect(
      (createQuotation as Function)({
        ...validCreatePayload,
        issueDate: '01-15-2026',
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid expiryDate format', async () => {
    await expect(
      (createQuotation as Function)({
        ...validCreatePayload,
        expiryDate: '02-15-2026',
      }),
    ).rejects.toThrow();
  });

  it('rejects empty lineItems array', async () => {
    await expect(
      (createQuotation as Function)({
        ...validCreatePayload,
        lineItems: [],
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid lineItem itemId uuid', async () => {
    await expect(
      (createQuotation as Function)({
        ...validCreatePayload,
        lineItems: [{ itemId: 'not-a-uuid', quantity: '1', unitPrice: '10' }],
      }),
    ).rejects.toThrow();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (createQuotation as Function)(validCreatePayload),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createQuotation).mockRejectedValue(new Error('duplicate quotation number'));

    await expect(
      (createQuotation as Function)(validCreatePayload),
    ).rejects.toThrow('duplicate quotation number');
  });

  it('creates with optional fields', async () => {
    const quotation = { id: 'qt-1', quotationNumber: 'QT-002' };
    vi.mocked(service.createQuotation).mockResolvedValue(quotation);

    await (createQuotation as Function)({
      ...validCreatePayload,
      notes: 'Quote for Q1 project',
      lineItems: [
        {
          itemId: VALID_UUID_2,
          quantity: '3',
          unitPrice: '200.00',
          description: 'Consulting service',
          discountPercent: '5',
          taxRate: '0.1',
        },
      ],
    });

    expect(service.createQuotation).toHaveBeenCalled();
  });
});

describe('updateQuotation', () => {
  it('updates a quotation', async () => {
    const quotation = { id: 'qt-1', quotationNumber: 'QT-001' };
    vi.mocked(service.updateQuotation).mockResolvedValue(quotation);

    const res = await (updateQuotation as Function)({
      id: 'qt-1',
      notes: 'Updated quote',
    });

    expect(service.updateQuotation).toHaveBeenCalledWith(
      'qt-1',
      { notes: 'Updated quote' },
      TEST_TENANT_ID,
    );
    expect(res).toEqual(quotation);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (updateQuotation as Function)({ id: 'qt-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateQuotation).mockRejectedValue(new Error('not found'));

    await expect(
      (updateQuotation as Function)({ id: 'bad', notes: 'x' }),
    ).rejects.toThrow('not found');
  });

  it('updates with valid line items', async () => {
    const quotation = { id: 'qt-1', quotationNumber: 'QT-001' };
    vi.mocked(service.updateQuotation).mockResolvedValue(quotation);

    await (updateQuotation as Function)({
      id: 'qt-1',
      lineItems: [
        { itemId: VALID_UUID_2, quantity: '10', unitPrice: '50.00' },
      ],
    });

    expect(service.updateQuotation).toHaveBeenCalled();
  });
});

describe('updateQuotationStatus', () => {
  it('updates quotation status', async () => {
    const quotation = { id: 'qt-1', status: 'sent' };
    vi.mocked(service.updateQuotationStatus).mockResolvedValue(quotation);

    const res = await (updateQuotationStatus as Function)({ id: 'qt-1', status: 'sent' });

    expect(service.updateQuotationStatus).toHaveBeenCalledWith('qt-1', 'sent', TEST_TENANT_ID);
    expect(res).toEqual(quotation);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (updateQuotationStatus as Function)({ id: 'qt-1', status: 'sent' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateQuotationStatus).mockRejectedValue(new Error('invalid transition'));

    await expect(
      (updateQuotationStatus as Function)({ id: 'qt-1', status: 'accepted' }),
    ).rejects.toThrow('invalid transition');
  });
});

describe('deleteQuotation', () => {
  it('deletes a quotation', async () => {
    vi.mocked(service.deleteQuotation).mockResolvedValue(undefined);

    await (deleteQuotation as Function)({ id: 'qt-1' });

    expect(service.deleteQuotation).toHaveBeenCalledWith('qt-1', TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (deleteQuotation as Function)({ id: 'qt-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.deleteQuotation).mockRejectedValue(new Error('cannot delete non-draft quotation'));

    await expect(
      (deleteQuotation as Function)({ id: 'qt-1' }),
    ).rejects.toThrow('cannot delete non-draft quotation');
  });
});

// ─── Quotation Line Item Tests ──────────────────────────────────────────────

describe('createQuotationLineItem', () => {
  it('creates a line item for a quotation', async () => {
    const lineItem = { id: 'qli-1', itemId: VALID_UUID_2, quantity: '5' };
    vi.mocked(service.createQuotationLineItem).mockResolvedValue(lineItem);

    const res = await (createQuotationLineItem as Function)({
      quotationId: 'qt-1',
      itemId: VALID_UUID_2,
      quantity: '5',
      unitPrice: '100.00',
    });

    expect(service.createQuotationLineItem).toHaveBeenCalledWith(
      'qt-1',
      { itemId: VALID_UUID_2, quantity: '5', unitPrice: '100.00' },
      TEST_TENANT_ID,
    );
    expect(res).toEqual(lineItem);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (createQuotationLineItem as Function)({
        quotationId: 'qt-1',
        itemId: VALID_UUID_2,
        quantity: '5',
        unitPrice: '100.00',
      }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createQuotationLineItem).mockRejectedValue(new Error('quotation not in draft'));

    await expect(
      (createQuotationLineItem as Function)({
        quotationId: 'qt-1',
        itemId: VALID_UUID_2,
        quantity: '5',
        unitPrice: '100.00',
      }),
    ).rejects.toThrow('quotation not in draft');
  });

  it('creates with optional fields', async () => {
    const lineItem = { id: 'qli-1' };
    vi.mocked(service.createQuotationLineItem).mockResolvedValue(lineItem);

    await (createQuotationLineItem as Function)({
      quotationId: 'qt-1',
      itemId: VALID_UUID_2,
      quantity: '2',
      unitPrice: '250.00',
      description: 'Annual subscription',
      discountPercent: '15',
      taxRate: '0.08',
    });

    expect(service.createQuotationLineItem).toHaveBeenCalled();
  });
});

describe('updateQuotationLineItem', () => {
  it('updates a quotation line item', async () => {
    const lineItem = { id: 'qli-1', quantity: '10' };
    vi.mocked(service.updateQuotationLineItem).mockResolvedValue(lineItem);

    const res = await (updateQuotationLineItem as Function)({
      id: 'qli-1',
      quantity: '10',
    });

    expect(service.updateQuotationLineItem).toHaveBeenCalledWith(
      'qli-1',
      { quantity: '10' },
      TEST_TENANT_ID,
    );
    expect(res).toEqual(lineItem);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (updateQuotationLineItem as Function)({ id: 'qli-1', quantity: '10' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateQuotationLineItem).mockRejectedValue(new Error('line item not found'));

    await expect(
      (updateQuotationLineItem as Function)({ id: 'bad', quantity: '10' }),
    ).rejects.toThrow('line item not found');
  });

  it('updates with all optional fields', async () => {
    const lineItem = { id: 'qli-1' };
    vi.mocked(service.updateQuotationLineItem).mockResolvedValue(lineItem);

    await (updateQuotationLineItem as Function)({
      id: 'qli-1',
      itemId: VALID_UUID_3,
      description: 'Updated description',
      quantity: '20',
      unitPrice: '150.00',
      discountPercent: '10',
      discountAmount: '25.00',
      taxRate: '0.1',
      taxAmount: '15.00',
    });

    expect(service.updateQuotationLineItem).toHaveBeenCalled();
  });
});

describe('deleteQuotationLineItem', () => {
  it('deletes a quotation line item', async () => {
    vi.mocked(service.deleteQuotationLineItem).mockResolvedValue(undefined);

    await (deleteQuotationLineItem as Function)({ id: 'qli-1' });

    expect(service.deleteQuotationLineItem).toHaveBeenCalledWith('qli-1', TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (deleteQuotationLineItem as Function)({ id: 'qli-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.deleteQuotationLineItem).mockRejectedValue(new Error('line item not found'));

    await expect(
      (deleteQuotationLineItem as Function)({ id: 'bad' }),
    ).rejects.toThrow('line item not found');
  });
});

// ─── Discount Policy Tests ──────────────────────────────────────────────────

describe('listDiscountPolicies', () => {
  it('returns paginated discount policies', async () => {
    const result = { data: [], total: 0, limit: 50, offset: 0 };
    vi.mocked(service.listDiscountPolicies).mockResolvedValue(result);

    const res = await (listDiscountPolicies as Function)({
      customerId: VALID_UUID,
      type: 'percentage',
      limit: 25,
      offset: 10,
    });

    expect(service.listDiscountPolicies).toHaveBeenCalledWith(TEST_TENANT_ID, {
      customerId: VALID_UUID,
      type: 'percentage',
      limit: 25,
      offset: 10,
    });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listDiscountPolicies).mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

    await (listDiscountPolicies as Function)({});

    expect(service.listDiscountPolicies).toHaveBeenCalledWith(TEST_TENANT_ID, {
      customerId: undefined,
      type: undefined,
      limit: 50,
      offset: 0,
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listDiscountPolicies as Function)({})).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.listDiscountPolicies).mockRejectedValue(new Error('db error'));

    await expect((listDiscountPolicies as Function)({})).rejects.toThrow('db error');
  });
});

describe('getDiscountPolicy', () => {
  it('returns a discount policy by id', async () => {
    const policy = { id: 'dp-1', name: 'Bulk Discount' };
    vi.mocked(service.getDiscountPolicy).mockResolvedValue(policy);

    const res = await (getDiscountPolicy as Function)({ id: 'dp-1' });

    expect(service.getDiscountPolicy).toHaveBeenCalledWith('dp-1', TEST_TENANT_ID);
    expect(res).toEqual(policy);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (getDiscountPolicy as Function)({ id: 'dp-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getDiscountPolicy).mockRejectedValue(new Error('not found'));

    await expect((getDiscountPolicy as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('createDiscountPolicy', () => {
  const validCreatePayload = {
    name: 'Bulk Discount',
    type: 'percentage' as const,
    value: '15',
    validFrom: '2026-01-01',
  };

  it('creates a discount policy with valid data', async () => {
    const policy = { id: 'dp-1', name: 'Bulk Discount' };
    vi.mocked(service.createDiscountPolicy).mockResolvedValue(policy);

    const res = await (createDiscountPolicy as Function)(validCreatePayload);

    expect(service.createDiscountPolicy).toHaveBeenCalled();
    expect(res).toEqual(policy);
  });

  it('rejects missing name', async () => {
    await expect(
      (createDiscountPolicy as Function)({
        type: 'percentage',
        value: '15',
        validFrom: '2026-01-01',
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid type enum', async () => {
    await expect(
      (createDiscountPolicy as Function)({
        name: 'Bad Discount',
        type: 'invalid_type',
        value: '15',
        validFrom: '2026-01-01',
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid validFrom format', async () => {
    await expect(
      (createDiscountPolicy as Function)({
        name: 'Bad Discount',
        type: 'percentage',
        value: '15',
        validFrom: '01-01-2026',
      }),
    ).rejects.toThrow();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (createDiscountPolicy as Function)(validCreatePayload),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createDiscountPolicy).mockRejectedValue(new Error('duplicate name'));

    await expect(
      (createDiscountPolicy as Function)(validCreatePayload),
    ).rejects.toThrow('duplicate name');
  });

  it('creates with optional fields', async () => {
    const policy = { id: 'dp-1', name: 'VIP Discount' };
    vi.mocked(service.createDiscountPolicy).mockResolvedValue(policy);

    await (createDiscountPolicy as Function)({
      name: 'VIP Discount',
      type: 'fixed_amount',
      value: '50.00',
      minQuantity: '10',
      maxDiscountAmount: '200.00',
      validFrom: '2026-01-01',
      validUntil: '2026-12-31',
      customerId: VALID_UUID,
    });

    expect(service.createDiscountPolicy).toHaveBeenCalled();
  });
});

describe('updateDiscountPolicy', () => {
  it('updates a discount policy', async () => {
    const policy = { id: 'dp-1', name: 'Updated Discount' };
    vi.mocked(service.updateDiscountPolicy).mockResolvedValue(policy);

    const res = await (updateDiscountPolicy as Function)({
      id: 'dp-1',
      name: 'Updated Discount',
    });

    expect(service.updateDiscountPolicy).toHaveBeenCalledWith(
      'dp-1',
      { name: 'Updated Discount' },
      TEST_TENANT_ID,
    );
    expect(res).toEqual(policy);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (updateDiscountPolicy as Function)({ id: 'dp-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateDiscountPolicy).mockRejectedValue(new Error('not found'));

    await expect(
      (updateDiscountPolicy as Function)({ id: 'bad', name: 'X' }),
    ).rejects.toThrow('not found');
  });

  it('updates with all optional fields', async () => {
    const policy = { id: 'dp-1', name: 'Full Update' };
    vi.mocked(service.updateDiscountPolicy).mockResolvedValue(policy);

    await (updateDiscountPolicy as Function)({
      id: 'dp-1',
      name: 'Full Update',
      type: 'tiered',
      value: '20',
      minQuantity: '5',
      maxDiscountAmount: '100',
      validFrom: '2026-06-01',
      validUntil: '2026-12-31',
      customerId: VALID_UUID_3,
    });

    expect(service.updateDiscountPolicy).toHaveBeenCalled();
  });
});

describe('deleteDiscountPolicy', () => {
  it('deletes a discount policy', async () => {
    vi.mocked(service.deleteDiscountPolicy).mockResolvedValue(undefined);

    await (deleteDiscountPolicy as Function)({ id: 'dp-1' });

    expect(service.deleteDiscountPolicy).toHaveBeenCalledWith('dp-1', TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (deleteDiscountPolicy as Function)({ id: 'dp-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.deleteDiscountPolicy).mockRejectedValue(new Error('not found'));

    await expect(
      (deleteDiscountPolicy as Function)({ id: 'bad' }),
    ).rejects.toThrow('not found');
  });
});
