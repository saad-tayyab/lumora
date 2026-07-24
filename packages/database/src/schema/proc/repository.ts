import { and, asc, count, desc, eq, gte, lte, type SQL } from 'drizzle-orm';

import { db } from '../../index';
import type {
  NewPoLineItem,
  NewPurchaseOrder,
  NewReceivingReport,
  NewVendorCatalogItem,
  PoLineItem,
  PurchaseOrder,
  ReceivingReport,
  VendorCatalogItem,
} from './schema';
import { poLineItems, purchaseOrders, receivingReports, vendorCatalogItems } from './schema';

// ─── Purchase Orders ───────────────────────────────────────────────────────────

export const purchaseOrdersRepository = {
  async findById(id: string): Promise<PurchaseOrder | undefined> {
    return db.query.purchaseOrders.findFirst({
      where: eq(purchaseOrders.id, id),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }): Promise<{
    data: PurchaseOrder[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(purchaseOrders.id) } = args ?? {};
    const data = await db.query.purchaseOrders.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(purchaseOrders);
    return { data, total: total[0].count, limit, offset };
  },

  async findByTenant(
    tenantId: string,
    args?: { limit?: number; offset?: number },
  ): Promise<{
    data: PurchaseOrder[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0 } = args ?? {};
    const data = await db.query.purchaseOrders.findMany({
      where: eq(purchaseOrders.tenantId, tenantId),
      limit,
      offset,
    });
    const total = await db
      .select({ count: count() })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByPoNumber(poNumber: string): Promise<PurchaseOrder | undefined> {
    return db.query.purchaseOrders.findFirst({
      where: eq(purchaseOrders.poNumber, poNumber),
    });
  },

  async findByVendor(tenantId: string, vendorId: string): Promise<PurchaseOrder[]> {
    return db.query.purchaseOrders.findMany({
      where: and(eq(purchaseOrders.tenantId, tenantId), eq(purchaseOrders.vendorId, vendorId)),
      orderBy: desc(purchaseOrders.orderDate),
    });
  },

  async findByStatus(tenantId: string, status: PurchaseOrder['status']): Promise<PurchaseOrder[]> {
    return db.query.purchaseOrders.findMany({
      where: and(eq(purchaseOrders.tenantId, tenantId), eq(purchaseOrders.status, status)),
      orderBy: desc(purchaseOrders.orderDate),
    });
  },

  async findByDateRange(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<PurchaseOrder[]> {
    return db.query.purchaseOrders.findMany({
      where: and(
        eq(purchaseOrders.tenantId, tenantId),
        gte(purchaseOrders.orderDate, startDate),
        lte(purchaseOrders.orderDate, endDate),
      ),
      orderBy: asc(purchaseOrders.orderDate),
    });
  },

  async create(data: NewPurchaseOrder): Promise<PurchaseOrder[]> {
    return db.insert(purchaseOrders).values(data).returning();
  },

  async update(id: string, data: Partial<NewPurchaseOrder>): Promise<PurchaseOrder[]> {
    return db.update(purchaseOrders).set(data).where(eq(purchaseOrders.id, id)).returning();
  },

  async delete(id: string): Promise<PurchaseOrder[]> {
    return db.delete(purchaseOrders).where(eq(purchaseOrders.id, id)).returning();
  },
};

// ─── PO Line Items ─────────────────────────────────────────────────────────────

export const poLineItemsRepository = {
  async findById(id: string): Promise<PoLineItem | undefined> {
    return db.query.poLineItems.findFirst({
      where: eq(poLineItems.id, id),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }): Promise<{
    data: PoLineItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(poLineItems.id) } = args ?? {};
    const data = await db.query.poLineItems.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(poLineItems);
    return { data, total: total[0].count, limit, offset };
  },

  async findByPoId(poId: string): Promise<PoLineItem[]> {
    return db.query.poLineItems.findMany({
      where: eq(poLineItems.poId, poId),
      orderBy: asc(poLineItems.lineNumber),
    });
  },

  async findByItemId(itemId: string): Promise<PoLineItem[]> {
    return db.query.poLineItems.findMany({
      where: eq(poLineItems.itemId, itemId),
      orderBy: desc(poLineItems.createdAt),
    });
  },

  async create(data: NewPoLineItem): Promise<PoLineItem[]> {
    return db.insert(poLineItems).values(data).returning();
  },

  async update(id: string, data: Partial<NewPoLineItem>): Promise<PoLineItem[]> {
    return db.update(poLineItems).set(data).where(eq(poLineItems.id, id)).returning();
  },

  async delete(id: string): Promise<PoLineItem[]> {
    return db.delete(poLineItems).where(eq(poLineItems.id, id)).returning();
  },
};

// ─── Receiving Reports ─────────────────────────────────────────────────────────

export const receivingReportsRepository = {
  async findById(id: string): Promise<ReceivingReport | undefined> {
    return db.query.receivingReports.findFirst({
      where: eq(receivingReports.id, id),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }): Promise<{
    data: ReceivingReport[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(receivingReports.id) } = args ?? {};
    const data = await db.query.receivingReports.findMany({
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(receivingReports);
    return { data, total: total[0].count, limit, offset };
  },

  async findByTenant(
    tenantId: string,
    args?: { limit?: number; offset?: number },
  ): Promise<{
    data: ReceivingReport[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0 } = args ?? {};
    const data = await db.query.receivingReports.findMany({
      where: eq(receivingReports.tenantId, tenantId),
      limit,
      offset,
    });
    const total = await db
      .select({ count: count() })
      .from(receivingReports)
      .where(eq(receivingReports.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByRrNumber(rrNumber: string): Promise<ReceivingReport | undefined> {
    return db.query.receivingReports.findFirst({
      where: eq(receivingReports.rrNumber, rrNumber),
    });
  },

  async findByPoId(poId: string): Promise<ReceivingReport[]> {
    return db.query.receivingReports.findMany({
      where: eq(receivingReports.poId, poId),
      orderBy: desc(receivingReports.receivedDate),
    });
  },

  async findByVendor(tenantId: string, vendorId: string): Promise<ReceivingReport[]> {
    return db.query.receivingReports.findMany({
      where: and(eq(receivingReports.tenantId, tenantId), eq(receivingReports.vendorId, vendorId)),
      orderBy: desc(receivingReports.receivedDate),
    });
  },

  async findByStatus(
    tenantId: string,
    status: ReceivingReport['status'],
  ): Promise<ReceivingReport[]> {
    return db.query.receivingReports.findMany({
      where: and(eq(receivingReports.tenantId, tenantId), eq(receivingReports.status, status)),
      orderBy: desc(receivingReports.receivedDate),
    });
  },

  async create(data: NewReceivingReport): Promise<ReceivingReport[]> {
    return db.insert(receivingReports).values(data).returning();
  },

  async update(id: string, data: Partial<NewReceivingReport>): Promise<ReceivingReport[]> {
    return db.update(receivingReports).set(data).where(eq(receivingReports.id, id)).returning();
  },

  async delete(id: string): Promise<ReceivingReport[]> {
    return db.delete(receivingReports).where(eq(receivingReports.id, id)).returning();
  },
};

// ─── Vendor Catalog Items ──────────────────────────────────────────────────────
// Composite unique: (vendorId, vendorItemCode)

export const vendorCatalogItemsRepository = {
  async findById(id: string): Promise<VendorCatalogItem | undefined> {
    return db.query.vendorCatalogItems.findFirst({
      where: eq(vendorCatalogItems.id, id),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }): Promise<{
    data: VendorCatalogItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(vendorCatalogItems.id) } = args ?? {};
    const data = await db.query.vendorCatalogItems.findMany({
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(vendorCatalogItems);
    return { data, total: total[0].count, limit, offset };
  },

  async findByVendorAndCode(
    vendorId: string,
    vendorItemCode: string,
  ): Promise<VendorCatalogItem | undefined> {
    return db.query.vendorCatalogItems.findFirst({
      where: and(
        eq(vendorCatalogItems.vendorId, vendorId),
        eq(vendorCatalogItems.vendorItemCode, vendorItemCode),
      ),
    });
  },

  async findByVendor(vendorId: string): Promise<VendorCatalogItem[]> {
    return db.query.vendorCatalogItems.findMany({
      where: eq(vendorCatalogItems.vendorId, vendorId),
      orderBy: asc(vendorCatalogItems.vendorItemCode),
    });
  },

  async findByInternalItemId(internalItemId: string): Promise<VendorCatalogItem[]> {
    return db.query.vendorCatalogItems.findMany({
      where: eq(vendorCatalogItems.internalItemId, internalItemId),
      orderBy: asc(vendorCatalogItems.unitPrice),
    });
  },

  async findEffective(vendorId: string, asOfDate: string): Promise<VendorCatalogItem[]> {
    return db.query.vendorCatalogItems.findMany({
      where: and(
        eq(vendorCatalogItems.vendorId, vendorId),
        lte(vendorCatalogItems.effectiveDate, asOfDate),
      ),
      orderBy: asc(vendorCatalogItems.vendorItemCode),
    });
  },

  async create(data: NewVendorCatalogItem): Promise<VendorCatalogItem[]> {
    return db.insert(vendorCatalogItems).values(data).returning();
  },

  async update(id: string, data: Partial<NewVendorCatalogItem>): Promise<VendorCatalogItem[]> {
    return db.update(vendorCatalogItems).set(data).where(eq(vendorCatalogItems.id, id)).returning();
  },

  async delete(id: string): Promise<VendorCatalogItem[]> {
    return db.delete(vendorCatalogItems).where(eq(vendorCatalogItems.id, id)).returning();
  },
};
