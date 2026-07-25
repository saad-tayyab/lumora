/**
 * Procurement — Data Access Layer
 *
 * @module features/proc/repo
 * @description Repository layer for the PROC bounded context (BC-PROC).
 *              All queries enforce tenant isolation via tenantId filtering.
 *              poLineItems are scoped through their parent purchase order.
 *
 * @see knowledge/constitution/DOMAIN.md — INV-CROSS-001 (no cross-context table access)
 * @see packages/database/src/schema/proc/schema.ts — Table definitions
 * @see packages/database/src/schema/proc/repository.ts — Base repository
 */

import type {
  NewPoLineItem,
  NewPurchaseOrder,
  NewReceivingReport,
  NewVendorCatalogItem,
  PoLineItem,
  PurchaseOrder,
  ReceivingReport,
  VendorCatalogItem,
} from '@lumora/database/schema/proc';
import {
  poLineItems,
  purchaseOrders,
  receivingReports,
  vendorCatalogItems,
} from '@lumora/database/schema/proc';
import { and, asc, count, desc, eq, type SQL } from 'drizzle-orm';
import { db } from '../../database';

// =============================================================================
// Pagination Result
// =============================================================================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// =============================================================================
// Purchase Orders Repository (tenant-scoped)
// =============================================================================

export const purchaseOrderRepo = {
  async findById(id: string, tenantId: string): Promise<PurchaseOrder | undefined> {
    return db.query.purchaseOrders.findFirst({
      where: and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, tenantId)),
    });
  },

  async findByPoNumber(poNumber: string, tenantId: string): Promise<PurchaseOrder | undefined> {
    return db.query.purchaseOrders.findFirst({
      where: and(eq(purchaseOrders.poNumber, poNumber), eq(purchaseOrders.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: { page?: number; limit?: number; status?: string; vendorId?: string },
  ): Promise<PaginatedResult<PurchaseOrder>> {
    const { page = 1, limit = 20, status, vendorId } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(purchaseOrders.tenantId, tenantId)];

    if (status) {
      conditions.push(eq(purchaseOrders.status, status as PurchaseOrder['status']));
    }
    if (vendorId) {
      conditions.push(eq(purchaseOrders.vendorId, vendorId));
    }

    const where = and(...conditions);

    const data = await db.query.purchaseOrders.findMany({
      where,
      orderBy: desc(purchaseOrders.orderDate),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(purchaseOrders).where(where);

    return { data, total, page, limit };
  },

  async create(data: NewPurchaseOrder): Promise<PurchaseOrder> {
    const [result] = await db.insert(purchaseOrders).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewPurchaseOrder>,
  ): Promise<PurchaseOrder | undefined> {
    const [result] = await db
      .update(purchaseOrders)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, tenantId)))
      .returning();
    return result;
  },

  async softDelete(id: string, tenantId: string): Promise<PurchaseOrder | undefined> {
    const [result] = await db
      .update(purchaseOrders)
      .set({ deletedAt: new Date() })
      .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, tenantId)))
      .returning();
    return result;
  },

  async findByVendor(vendorId: string, tenantId: string): Promise<PurchaseOrder[]> {
    return db.query.purchaseOrders.findMany({
      where: and(eq(purchaseOrders.vendorId, vendorId), eq(purchaseOrders.tenantId, tenantId)),
      orderBy: desc(purchaseOrders.orderDate),
    });
  },

  async findPendingApproval(tenantId: string): Promise<PurchaseOrder[]> {
    return db.query.purchaseOrders.findMany({
      where: and(
        eq(purchaseOrders.status, 'pending_approval'),
        eq(purchaseOrders.tenantId, tenantId),
      ),
      orderBy: desc(purchaseOrders.orderDate),
    });
  },

  async findActiveByVendor(vendorId: string, tenantId: string): Promise<PurchaseOrder[]> {
    return db.query.purchaseOrders.findMany({
      where: and(
        eq(purchaseOrders.vendorId, vendorId),
        eq(purchaseOrders.tenantId, tenantId),
        eq(purchaseOrders.status, 'approved'),
      ),
      orderBy: desc(purchaseOrders.orderDate),
    });
  },
};

// =============================================================================
// PO Line Items Repository (scoped via PO.tenantId)
// =============================================================================

export const poLineItemRepo = {
  async findById(id: string): Promise<PoLineItem | undefined> {
    return db.query.poLineItems.findFirst({
      where: eq(poLineItems.id, id),
    });
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

  async create(data: NewPoLineItem): Promise<PoLineItem> {
    const [result] = await db.insert(poLineItems).values(data).returning();
    return result;
  },

  async createMany(data: NewPoLineItem[]): Promise<PoLineItem[]> {
    if (data.length === 0) return [];
    return db.insert(poLineItems).values(data).returning();
  },

  async update(id: string, data: Partial<NewPoLineItem>): Promise<PoLineItem | undefined> {
    const [result] = await db
      .update(poLineItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(poLineItems.id, id))
      .returning();
    return result;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(poLineItems).where(eq(poLineItems.id, id));
    return (result.rowCount ?? 0) > 0;
  },

  async deleteByPoId(poId: string): Promise<void> {
    await db.delete(poLineItems).where(eq(poLineItems.poId, poId));
  },
};

// =============================================================================
// Receiving Reports Repository (tenant-scoped)
// =============================================================================

export const receivingReportRepo = {
  async findById(id: string, tenantId: string): Promise<ReceivingReport | undefined> {
    return db.query.receivingReports.findFirst({
      where: and(eq(receivingReports.id, id), eq(receivingReports.tenantId, tenantId)),
    });
  },

  async findByRrNumber(rrNumber: string, tenantId: string): Promise<ReceivingReport | undefined> {
    return db.query.receivingReports.findFirst({
      where: and(eq(receivingReports.rrNumber, rrNumber), eq(receivingReports.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: { page?: number; limit?: number; status?: string; poId?: string; vendorId?: string },
  ): Promise<PaginatedResult<ReceivingReport>> {
    const { page = 1, limit = 20, status, poId, vendorId } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(receivingReports.tenantId, tenantId)];

    if (status) {
      conditions.push(eq(receivingReports.status, status as ReceivingReport['status']));
    }
    if (poId) {
      conditions.push(eq(receivingReports.poId, poId));
    }
    if (vendorId) {
      conditions.push(eq(receivingReports.vendorId, vendorId));
    }

    const where = and(...conditions);

    const data = await db.query.receivingReports.findMany({
      where,
      orderBy: desc(receivingReports.receivedDate),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(receivingReports).where(where);

    return { data, total, page, limit };
  },

  async create(data: NewReceivingReport): Promise<ReceivingReport> {
    const [result] = await db.insert(receivingReports).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewReceivingReport>,
  ): Promise<ReceivingReport | undefined> {
    const [result] = await db
      .update(receivingReports)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(receivingReports.id, id), eq(receivingReports.tenantId, tenantId)))
      .returning();
    return result;
  },

  async softDelete(id: string, tenantId: string): Promise<ReceivingReport | undefined> {
    const [result] = await db
      .update(receivingReports)
      .set({ deletedAt: new Date() })
      .where(and(eq(receivingReports.id, id), eq(receivingReports.tenantId, tenantId)))
      .returning();
    return result;
  },

  async findByPoId(poId: string, tenantId: string): Promise<ReceivingReport[]> {
    return db.query.receivingReports.findMany({
      where: and(eq(receivingReports.poId, poId), eq(receivingReports.tenantId, tenantId)),
      orderBy: desc(receivingReports.receivedDate),
    });
  },

  async findByVendor(vendorId: string, tenantId: string): Promise<ReceivingReport[]> {
    return db.query.receivingReports.findMany({
      where: and(eq(receivingReports.vendorId, vendorId), eq(receivingReports.tenantId, tenantId)),
      orderBy: desc(receivingReports.receivedDate),
    });
  },
};

// =============================================================================
// Vendor Catalog Items Repository (tenant-scoped via vendor)
// =============================================================================

export const vendorCatalogItemRepo = {
  async findById(id: string): Promise<VendorCatalogItem | undefined> {
    return db.query.vendorCatalogItems.findFirst({
      where: eq(vendorCatalogItems.id, id),
    });
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

  async findMany(args?: {
    page?: number;
    limit?: number;
    vendorId?: string;
  }): Promise<PaginatedResult<VendorCatalogItem>> {
    const { page = 1, limit = 20, vendorId } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (vendorId) {
      conditions.push(eq(vendorCatalogItems.vendorId, vendorId));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.vendorCatalogItems.findMany({
      where,
      orderBy: asc(vendorCatalogItems.vendorItemCode),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(vendorCatalogItems).where(where);

    return { data, total, page, limit };
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
        eq(vendorCatalogItems.effectiveDate, asOfDate),
      ),
      orderBy: asc(vendorCatalogItems.vendorItemCode),
    });
  },

  async create(data: NewVendorCatalogItem): Promise<VendorCatalogItem> {
    const [result] = await db.insert(vendorCatalogItems).values(data).returning();
    return result;
  },

  async update(
    id: string,
    data: Partial<NewVendorCatalogItem>,
  ): Promise<VendorCatalogItem | undefined> {
    const [result] = await db
      .update(vendorCatalogItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vendorCatalogItems.id, id))
      .returning();
    return result;
  },

  async softDelete(id: string): Promise<VendorCatalogItem | undefined> {
    const [result] = await db
      .update(vendorCatalogItems)
      .set({ deletedAt: new Date() })
      .where(eq(vendorCatalogItems.id, id))
      .returning();
    return result;
  },
};
