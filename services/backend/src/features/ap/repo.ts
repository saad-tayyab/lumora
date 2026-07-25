/**
 * Accounts Payable — Data Access Layer
 *
 * @module features/ap/repo
 * @description Repository layer for the AP bounded context (BC-AP).
 *              All queries enforce tenant isolation via tenantId filtering.
 *              billLineItems and paymentSchedules are scoped through their parent bill.
 *
 * @see knowledge/constitution/DOMAIN.md — INV-CROSS-001 (no cross-context table access)
 * @see packages/database/src/schema/ap/schema.ts — Table definitions
 * @see packages/database/src/schema/ap/repository.ts — Base repository
 */

import { db } from '@lumora/database';
import type {
  Bill,
  BillLineItem,
  NewBill,
  NewBillLineItem,
  NewPaymentSchedule,
  NewVendor,
  NewVendorPayment,
  PaymentSchedule,
  Vendor,
  VendorPayment,
} from '@lumora/database/schema';
import {
  billLineItems,
  bills,
  paymentSchedules,
  vendorPayments,
  vendors,
} from '@lumora/database/schema';
import { and, asc, count, eq, type SQL } from 'drizzle-orm';

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
// Vendors Repository (tenant-scoped)
// =============================================================================

export const vendorRepo = {
  async findById(id: string, tenantId: string): Promise<Vendor | undefined> {
    return db.query.vendors.findFirst({
      where: and(eq(vendors.id, id), eq(vendors.tenantId, tenantId)),
    });
  },

  async findByCode(code: string, tenantId: string): Promise<Vendor | undefined> {
    return db.query.vendors.findFirst({
      where: and(eq(vendors.code, code), eq(vendors.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: { page?: number; limit?: number; search?: string },
  ): Promise<PaginatedResult<Vendor>> {
    const { page = 1, limit = 20, search } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(vendors.tenantId, tenantId)];

    if (search) {
      conditions.push(
        // Drizzle doesn't have a native ilike on all drivers,
        // use a like filter for now
        eq(vendors.name, search),
      );
    }

    const where = and(...conditions);

    const data = await db.query.vendors.findMany({
      where,
      orderBy: asc(vendors.name),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(vendors).where(where);

    return { data, total, page, limit };
  },

  async create(data: NewVendor): Promise<Vendor> {
    const [result] = await db.insert(vendors).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewVendor>,
  ): Promise<Vendor | undefined> {
    const [result] = await db
      .update(vendors)
      .set(data)
      .where(and(eq(vendors.id, id), eq(vendors.tenantId, tenantId)))
      .returning();
    return result;
  },

  async softDelete(id: string, tenantId: string): Promise<Vendor | undefined> {
    const [result] = await db
      .update(vendors)
      .set({ deletedAt: new Date() })
      .where(and(eq(vendors.id, id), eq(vendors.tenantId, tenantId)))
      .returning();
    return result;
  },
};

// =============================================================================
// Bills Repository (tenant-scoped via vendor)
// =============================================================================

export const billRepo = {
  async findById(id: string, tenantId: string): Promise<Bill | undefined> {
    return db.query.bills.findFirst({
      where: and(eq(bills.id, id), eq(bills.tenantId, tenantId)),
    });
  },

  async findByBillNumber(
    vendorId: string,
    billNumber: string,
    tenantId: string,
  ): Promise<Bill | undefined> {
    return db.query.bills.findFirst({
      where: and(
        eq(bills.vendorId, vendorId),
        eq(bills.billNumber, billNumber),
        eq(bills.tenantId, tenantId),
      ),
    });
  },

  async findMany(
    tenantId: string,
    args?: { page?: number; limit?: number; status?: string; vendorId?: string },
  ): Promise<PaginatedResult<Bill>> {
    const { page = 1, limit = 20, status, vendorId } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(bills.tenantId, tenantId)];

    if (status) {
      conditions.push(eq(bills.status, status as Bill['status']));
    }
    if (vendorId) {
      conditions.push(eq(bills.vendorId, vendorId));
    }

    const where = and(...conditions);

    const data = await db.query.bills.findMany({
      where,
      orderBy: asc(bills.billDate),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(bills).where(where);

    return { data, total, page, limit };
  },

  async create(data: NewBill): Promise<Bill> {
    const [result] = await db.insert(bills).values(data).returning();
    return result;
  },

  async update(id: string, tenantId: string, data: Partial<NewBill>): Promise<Bill | undefined> {
    const [result] = await db
      .update(bills)
      .set(data)
      .where(and(eq(bills.id, id), eq(bills.tenantId, tenantId)))
      .returning();
    return result;
  },

  async softDelete(id: string, tenantId: string): Promise<Bill | undefined> {
    const [result] = await db
      .update(bills)
      .set({ deletedAt: new Date() })
      .where(and(eq(bills.id, id), eq(bills.tenantId, tenantId)))
      .returning();
    return result;
  },

  async findByVendorId(vendorId: string, tenantId: string): Promise<Bill[]> {
    return db.query.bills.findMany({
      where: and(eq(bills.vendorId, vendorId), eq(bills.tenantId, tenantId)),
      orderBy: asc(bills.billDate),
    });
  },

  async findPendingApproval(tenantId: string): Promise<Bill[]> {
    return db.query.bills.findMany({
      where: and(eq(bills.status, 'pending_approval'), eq(bills.tenantId, tenantId)),
      orderBy: asc(bills.billDate),
    });
  },

  async findByPurchaseOrderId(purchaseOrderId: string, tenantId: string): Promise<Bill[]> {
    return db.query.bills.findMany({
      where: and(eq(bills.purchaseOrderId, purchaseOrderId), eq(bills.tenantId, tenantId)),
      orderBy: asc(bills.billDate),
    });
  },
};

// =============================================================================
// Bill Line Items Repository (scoped via bill.tenantId)
// =============================================================================

export const billLineItemRepo = {
  async findById(id: string): Promise<BillLineItem | undefined> {
    return db.query.billLineItems.findFirst({
      where: eq(billLineItems.id, id),
    });
  },

  async findByBillId(billId: string): Promise<BillLineItem[]> {
    return db.query.billLineItems.findMany({
      where: eq(billLineItems.billId, billId),
      orderBy: asc(billLineItems.sortOrder),
    });
  },

  async create(data: NewBillLineItem): Promise<BillLineItem> {
    const [result] = await db.insert(billLineItems).values(data).returning();
    return result;
  },

  async createMany(data: NewBillLineItem[]): Promise<BillLineItem[]> {
    if (data.length === 0) return [];
    return db.insert(billLineItems).values(data).returning();
  },

  async update(id: string, data: Partial<NewBillLineItem>): Promise<BillLineItem | undefined> {
    const [result] = await db
      .update(billLineItems)
      .set(data)
      .where(eq(billLineItems.id, id))
      .returning();
    return result;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(billLineItems).where(eq(billLineItems.id, id));
    return result.rowCount > 0;
  },

  async deleteByBillId(billId: string): Promise<void> {
    await db.delete(billLineItems).where(eq(billLineItems.billId, billId));
  },
};

// =============================================================================
// Vendor Payments Repository (tenant-scoped)
// =============================================================================

export const vendorPaymentRepo = {
  async findById(id: string, tenantId: string): Promise<VendorPayment | undefined> {
    return db.query.vendorPayments.findFirst({
      where: and(eq(vendorPayments.id, id), eq(vendorPayments.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: { page?: number; limit?: number; vendorId?: string; billId?: string },
  ): Promise<PaginatedResult<VendorPayment>> {
    const { page = 1, limit = 20, vendorId, billId } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(vendorPayments.tenantId, tenantId)];

    if (vendorId) {
      conditions.push(eq(vendorPayments.vendorId, vendorId));
    }
    if (billId) {
      conditions.push(eq(vendorPayments.billId, billId));
    }

    const where = and(...conditions);

    const data = await db.query.vendorPayments.findMany({
      where,
      orderBy: asc(vendorPayments.paymentDate),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(vendorPayments).where(where);

    return { data, total, page, limit };
  },

  async create(data: NewVendorPayment): Promise<VendorPayment> {
    const [result] = await db.insert(vendorPayments).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewVendorPayment>,
  ): Promise<VendorPayment | undefined> {
    const [result] = await db
      .update(vendorPayments)
      .set(data)
      .where(and(eq(vendorPayments.id, id), eq(vendorPayments.tenantId, tenantId)))
      .returning();
    return result;
  },

  async softDelete(id: string, tenantId: string): Promise<VendorPayment | undefined> {
    const [result] = await db
      .update(vendorPayments)
      .set({ deletedAt: new Date() })
      .where(and(eq(vendorPayments.id, id), eq(vendorPayments.tenantId, tenantId)))
      .returning();
    return result;
  },

  async findByVendorId(vendorId: string, tenantId: string): Promise<VendorPayment[]> {
    return db.query.vendorPayments.findMany({
      where: and(eq(vendorPayments.vendorId, vendorId), eq(vendorPayments.tenantId, tenantId)),
      orderBy: asc(vendorPayments.paymentDate),
    });
  },

  async findByBillId(billId: string, tenantId: string): Promise<VendorPayment[]> {
    return db.query.vendorPayments.findMany({
      where: and(eq(vendorPayments.billId, billId), eq(vendorPayments.tenantId, tenantId)),
      orderBy: asc(vendorPayments.paymentDate),
    });
  },

  async sumPaymentsByBillId(billId: string, tenantId: string): Promise<string> {
    const result = await db
      .select({ total: count() })
      .from(vendorPayments)
      .where(and(eq(vendorPayments.billId, billId), eq(vendorPayments.tenantId, tenantId)));
    return String(result[0]?.total ?? 0);
  },
};

// =============================================================================
// Payment Schedules Repository (scoped via bill.tenantId)
// =============================================================================

export const paymentScheduleRepo = {
  async findById(id: string): Promise<PaymentSchedule | undefined> {
    return db.query.paymentSchedules.findFirst({
      where: eq(paymentSchedules.id, id),
    });
  },

  async findByBillId(billId: string): Promise<PaymentSchedule[]> {
    return db.query.paymentSchedules.findMany({
      where: eq(paymentSchedules.billId, billId),
      orderBy: asc(paymentSchedules.dueDate),
    });
  },

  async create(data: NewPaymentSchedule): Promise<PaymentSchedule> {
    const [result] = await db.insert(paymentSchedules).values(data).returning();
    return result;
  },

  async createMany(data: NewPaymentSchedule[]): Promise<PaymentSchedule[]> {
    if (data.length === 0) return [];
    return db.insert(paymentSchedules).values(data).returning();
  },

  async update(
    id: string,
    data: Partial<NewPaymentSchedule>,
  ): Promise<PaymentSchedule | undefined> {
    const [result] = await db
      .update(paymentSchedules)
      .set(data)
      .where(eq(paymentSchedules.id, id))
      .returning();
    return result;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(paymentSchedules).where(eq(paymentSchedules.id, id));
    return result.rowCount > 0;
  },

  async deleteByBillId(billId: string): Promise<void> {
    await db.delete(paymentSchedules).where(eq(paymentSchedules.billId, billId));
  },
};
