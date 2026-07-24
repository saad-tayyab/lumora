import { and, asc, count, eq, type SQL } from 'drizzle-orm';
import { db } from '../../index';
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
} from './schema';
import { billLineItems, bills, paymentSchedules, vendors, vendorPayments } from './schema';

// ─── Pagination Result Type ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Vendors Repository ─────────────────────────────────────────────────────────

export const vendorsRepository = {
  async findById(id: string): Promise<Vendor | undefined> {
    return db.query.vendors.findFirst({ where: eq(vendors.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<Vendor>> {
    const { limit = 50, offset = 0, orderBy = asc(vendors.id) } = args ?? {};
    const data = await db.query.vendors.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(vendors);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewVendor): Promise<Vendor[]> {
    return db.insert(vendors).values(data).returning();
  },

  async update(id: string, data: Partial<NewVendor>): Promise<Vendor[]> {
    return db.update(vendors).set(data).where(eq(vendors.id, id)).returning();
  },

  async delete(id: string): Promise<Vendor[]> {
    return db.delete(vendors).where(eq(vendors.id, id)).returning();
  },

  async findByTenantId(tenantId: string): Promise<Vendor[]> {
    return db.query.vendors.findMany({
      where: eq(vendors.tenantId, tenantId),
      orderBy: asc(vendors.name),
    });
  },

  async findByCode(code: string): Promise<Vendor | undefined> {
    return db.query.vendors.findFirst({ where: eq(vendors.code, code) });
  },

  async findActiveVendors(): Promise<Vendor[]> {
    return db.query.vendors.findMany({
      where: eq(vendors.isActive, true),
      orderBy: asc(vendors.name),
    });
  },

  async findByEmail(email: string): Promise<Vendor | undefined> {
    return db.query.vendors.findFirst({ where: eq(vendors.email, email) });
  },
};

// ─── Bills Repository ───────────────────────────────────────────────────────────

export const billsRepository = {
  async findById(id: string): Promise<Bill | undefined> {
    return db.query.bills.findFirst({ where: eq(bills.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<Bill>> {
    const { limit = 50, offset = 0, orderBy = asc(bills.id) } = args ?? {};
    const data = await db.query.bills.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(bills);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewBill): Promise<Bill[]> {
    return db.insert(bills).values(data).returning();
  },

  async update(id: string, data: Partial<NewBill>): Promise<Bill[]> {
    return db.update(bills).set(data).where(eq(bills.id, id)).returning();
  },

  async delete(id: string): Promise<Bill[]> {
    return db.delete(bills).where(eq(bills.id, id)).returning();
  },

  async findByVendorId(vendorId: string): Promise<Bill[]> {
    return db.query.bills.findMany({
      where: eq(bills.vendorId, vendorId),
      orderBy: asc(bills.billDate),
    });
  },

  async findByStatus(status: Bill['status']): Promise<Bill[]> {
    return db.query.bills.findMany({
      where: eq(bills.status, status),
      orderBy: asc(bills.billDate),
    });
  },

  async findByBillNumber(vendorId: string, billNumber: string): Promise<Bill | undefined> {
    return db.query.bills.findFirst({
      where: and(eq(bills.vendorId, vendorId), eq(bills.billNumber, billNumber)),
    });
  },

  async findByPurchaseOrderId(purchaseOrderId: string): Promise<Bill[]> {
    return db.query.bills.findMany({
      where: eq(bills.purchaseOrderId, purchaseOrderId),
      orderBy: asc(bills.billDate),
    });
  },

  async findPendingApproval(): Promise<Bill[]> {
    return db.query.bills.findMany({
      where: eq(bills.status, 'pending_approval'),
      orderBy: asc(bills.billDate),
    });
  },
};

// ─── Bill Line Items Repository ─────────────────────────────────────────────────

export const billLineItemsRepository = {
  async findById(id: string): Promise<BillLineItem | undefined> {
    return db.query.billLineItems.findFirst({
      where: eq(billLineItems.id, id),
    });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<BillLineItem>> {
    const { limit = 50, offset = 0, orderBy = asc(billLineItems.sortOrder) } = args ?? {};
    const data = await db.query.billLineItems.findMany({
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(billLineItems);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewBillLineItem): Promise<BillLineItem[]> {
    return db.insert(billLineItems).values(data).returning();
  },

  async update(id: string, data: Partial<NewBillLineItem>): Promise<BillLineItem[]> {
    return db.update(billLineItems).set(data).where(eq(billLineItems.id, id)).returning();
  },

  async delete(id: string): Promise<BillLineItem[]> {
    return db.delete(billLineItems).where(eq(billLineItems.id, id)).returning();
  },

  async findByBillId(billId: string): Promise<BillLineItem[]> {
    return db.query.billLineItems.findMany({
      where: eq(billLineItems.billId, billId),
      orderBy: asc(billLineItems.sortOrder),
    });
  },

  async deleteByBillId(billId: string): Promise<void> {
    await db.delete(billLineItems).where(eq(billLineItems.billId, billId));
  },
};

// ─── Vendor Payments Repository ───────────────────────────────────────────────

export const vendorPaymentsRepository = {
  async findById(id: string): Promise<VendorPayment | undefined> {
    return db.query.vendorPayments.findFirst({ where: eq(vendorPayments.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<VendorPayment>> {
    const { limit = 50, offset = 0, orderBy = asc(vendorPayments.id) } = args ?? {};
    const data = await db.query.vendorPayments.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(vendorPayments);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewVendorPayment): Promise<VendorPayment[]> {
    return db.insert(vendorPayments).values(data).returning();
  },

  async update(id: string, data: Partial<NewVendorPayment>): Promise<VendorPayment[]> {
    return db.update(vendorPayments).set(data).where(eq(vendorPayments.id, id)).returning();
  },

  async delete(id: string): Promise<VendorPayment[]> {
    return db.delete(vendorPayments).where(eq(vendorPayments.id, id)).returning();
  },

  async findByVendorId(vendorId: string): Promise<VendorPayment[]> {
    return db.query.vendorPayments.findMany({
      where: eq(vendorPayments.vendorId, vendorId),
      orderBy: asc(vendorPayments.paymentDate),
    });
  },

  async findByBillId(billId: string): Promise<VendorPayment[]> {
    return db.query.vendorPayments.findMany({
      where: eq(vendorPayments.billId, billId),
      orderBy: asc(vendorPayments.paymentDate),
    });
  },

  async findByPaymentDateRange(startDate: Date, endDate: Date): Promise<VendorPayment[]> {
    return db.query.vendorPayments.findMany({
      where: and(
        eq(vendorPayments.paymentDate, startDate),
        eq(vendorPayments.paymentDate, endDate),
      ),
      orderBy: asc(vendorPayments.paymentDate),
    });
  },
};

// ─── Payment Schedules Repository ─────────────────────────────────────────────

export const paymentSchedulesRepository = {
  async findById(id: string): Promise<PaymentSchedule | undefined> {
    return db.query.paymentSchedules.findFirst({ where: eq(paymentSchedules.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<PaymentSchedule>> {
    const { limit = 50, offset = 0, orderBy = asc(paymentSchedules.id) } = args ?? {};
    const data = await db.query.paymentSchedules.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(paymentSchedules);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewPaymentSchedule): Promise<PaymentSchedule[]> {
    return db.insert(paymentSchedules).values(data).returning();
  },

  async update(id: string, data: Partial<NewPaymentSchedule>): Promise<PaymentSchedule[]> {
    return db.update(paymentSchedules).set(data).where(eq(paymentSchedules.id, id)).returning();
  },

  async delete(id: string): Promise<PaymentSchedule[]> {
    return db.delete(paymentSchedules).where(eq(paymentSchedules.id, id)).returning();
  },

  async findByBillId(billId: string): Promise<PaymentSchedule[]> {
    return db.query.paymentSchedules.findMany({
      where: eq(paymentSchedules.billId, billId),
      orderBy: asc(paymentSchedules.dueDate),
    });
  },

  async findPending(): Promise<PaymentSchedule[]> {
    return db.query.paymentSchedules.findMany({
      where: eq(paymentSchedules.status, 'pending'),
      orderBy: asc(paymentSchedules.dueDate),
    });
  },

  async findOverdue(beforeDate: Date): Promise<PaymentSchedule[]> {
    return db.query.paymentSchedules.findMany({
      where: and(
        eq(paymentSchedules.status, 'pending'),
        eq(paymentSchedules.dueDate, beforeDate),
      ),
      orderBy: asc(paymentSchedules.dueDate),
    });
  },
};
