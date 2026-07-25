import { db } from '@lumora/database';
import type {
  DiscountPolicy,
  NewDiscountPolicy,
  NewQuotation,
  NewQuotationLineItem,
  NewSalesOrder,
  NewSalesOrderLineItem,
  Quotation,
  QuotationLineItem,
  SalesOrder,
  SalesOrderLineItem,
} from '@lumora/database/schema';
import {
  discountPolicies,
  quotationLineItems,
  quotations,
  salesOrderLineItems,
  salesOrders,
} from '@lumora/database/schema';
import { and, asc, count, eq, lte, type SQL } from 'drizzle-orm';

// ─── Pagination Result Type ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Sales Orders Repository ───────────────────────────────────────────────────

export const salesOrdersRepository = {
  async findById(id: string, tenantId: string): Promise<SalesOrder | undefined> {
    return db.query.salesOrders.findFirst({
      where: and(eq(salesOrders.id, id), eq(salesOrders.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      orderBy?: SQL;
      customerId?: string;
      status?: string;
    },
  ): Promise<PaginatedResult<SalesOrder>> {
    const {
      limit = 50,
      offset = 0,
      orderBy = asc(salesOrders.orderDate),
      customerId,
      status,
    } = args ?? {};

    const conditions: SQL[] = [eq(salesOrders.tenantId, tenantId)];
    if (customerId) conditions.push(eq(salesOrders.customerId, customerId));
    if (status) conditions.push(eq(salesOrders.status, status as SalesOrder['status']));

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    const data = await db.query.salesOrders.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(salesOrders).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async findByOrderNumber(orderNumber: string, tenantId: string): Promise<SalesOrder | undefined> {
    return db.query.salesOrders.findFirst({
      where: and(eq(salesOrders.orderNumber, orderNumber), eq(salesOrders.tenantId, tenantId)),
    });
  },

  async create(data: NewSalesOrder, tenantId: string): Promise<SalesOrder[]> {
    return db
      .insert(salesOrders)
      .values({ ...data, tenantId })
      .returning();
  },

  async update(id: string, tenantId: string, data: Partial<NewSalesOrder>): Promise<SalesOrder[]> {
    return db
      .update(salesOrders)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(salesOrders.id, id), eq(salesOrders.tenantId, tenantId)))
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<SalesOrder[]> {
    return db
      .delete(salesOrders)
      .where(and(eq(salesOrders.id, id), eq(salesOrders.tenantId, tenantId)))
      .returning();
  },
};

// ─── Sales Order Line Items Repository ─────────────────────────────────────────

export const salesOrderLineItemsRepository = {
  async findById(id: string, tenantId: string): Promise<SalesOrderLineItem | undefined> {
    return db.query.salesOrderLineItems.findFirst({
      where: and(eq(salesOrderLineItems.id, id), eq(salesOrderLineItems.tenantId, tenantId)),
    });
  },

  async findBySalesOrderId(salesOrderId: string, tenantId: string): Promise<SalesOrderLineItem[]> {
    return db.query.salesOrderLineItems.findMany({
      where: and(
        eq(salesOrderLineItems.salesOrderId, salesOrderId),
        eq(salesOrderLineItems.tenantId, tenantId),
      ),
    });
  },

  async create(data: NewSalesOrderLineItem, tenantId: string): Promise<SalesOrderLineItem[]> {
    return db
      .insert(salesOrderLineItems)
      .values({ ...data, tenantId })
      .returning();
  },

  async createMany(
    items: NewSalesOrderLineItem[],
    tenantId: string,
  ): Promise<SalesOrderLineItem[]> {
    const values = items.map((item) => ({ ...item, tenantId }));
    return db.insert(salesOrderLineItems).values(values).returning();
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewSalesOrderLineItem>,
  ): Promise<SalesOrderLineItem[]> {
    return db
      .update(salesOrderLineItems)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(salesOrderLineItems.id, id), eq(salesOrderLineItems.tenantId, tenantId)))
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<SalesOrderLineItem[]> {
    return db
      .delete(salesOrderLineItems)
      .where(and(eq(salesOrderLineItems.id, id), eq(salesOrderLineItems.tenantId, tenantId)))
      .returning();
  },

  async deleteBySalesOrderId(salesOrderId: string, tenantId: string): Promise<void> {
    await db
      .delete(salesOrderLineItems)
      .where(
        and(
          eq(salesOrderLineItems.salesOrderId, salesOrderId),
          eq(salesOrderLineItems.tenantId, tenantId),
        ),
      );
  },
};

// ─── Quotations Repository ─────────────────────────────────────────────────────

export const quotationsRepository = {
  async findById(id: string, tenantId: string): Promise<Quotation | undefined> {
    return db.query.quotations.findFirst({
      where: and(eq(quotations.id, id), eq(quotations.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      orderBy?: SQL;
      customerId?: string;
      status?: string;
    },
  ): Promise<PaginatedResult<Quotation>> {
    const {
      limit = 50,
      offset = 0,
      orderBy = asc(quotations.issueDate),
      customerId,
      status,
    } = args ?? {};

    const conditions: SQL[] = [eq(quotations.tenantId, tenantId)];
    if (customerId) conditions.push(eq(quotations.customerId, customerId));
    if (status) conditions.push(eq(quotations.status, status as Quotation['status']));

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    const data = await db.query.quotations.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(quotations).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async findByQuotationNumber(
    quotationNumber: string,
    tenantId: string,
  ): Promise<Quotation | undefined> {
    return db.query.quotations.findFirst({
      where: and(
        eq(quotations.quotationNumber, quotationNumber),
        eq(quotations.tenantId, tenantId),
      ),
    });
  },

  async findExpired(currentDate: string, tenantId: string): Promise<Quotation[]> {
    return db.query.quotations.findMany({
      where: and(
        eq(quotations.tenantId, tenantId),
        eq(quotations.status, 'sent'),
        lte(quotations.expiryDate, currentDate),
      ),
      orderBy: asc(quotations.expiryDate),
    });
  },

  async create(data: NewQuotation, tenantId: string): Promise<Quotation[]> {
    return db
      .insert(quotations)
      .values({ ...data, tenantId })
      .returning();
  },

  async update(id: string, tenantId: string, data: Partial<NewQuotation>): Promise<Quotation[]> {
    return db
      .update(quotations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(quotations.id, id), eq(quotations.tenantId, tenantId)))
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<Quotation[]> {
    return db
      .delete(quotations)
      .where(and(eq(quotations.id, id), eq(quotations.tenantId, tenantId)))
      .returning();
  },
};

// ─── Quotation Line Items Repository ───────────────────────────────────────────

export const quotationLineItemsRepository = {
  async findById(id: string, tenantId: string): Promise<QuotationLineItem | undefined> {
    return db.query.quotationLineItems.findFirst({
      where: and(eq(quotationLineItems.id, id), eq(quotationLineItems.tenantId, tenantId)),
    });
  },

  async findByQuotationId(quotationId: string, tenantId: string): Promise<QuotationLineItem[]> {
    return db.query.quotationLineItems.findMany({
      where: and(
        eq(quotationLineItems.quotationId, quotationId),
        eq(quotationLineItems.tenantId, tenantId),
      ),
    });
  },

  async create(data: NewQuotationLineItem, tenantId: string): Promise<QuotationLineItem[]> {
    return db
      .insert(quotationLineItems)
      .values({ ...data, tenantId })
      .returning();
  },

  async createMany(items: NewQuotationLineItem[], tenantId: string): Promise<QuotationLineItem[]> {
    const values = items.map((item) => ({ ...item, tenantId }));
    return db.insert(quotationLineItems).values(values).returning();
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewQuotationLineItem>,
  ): Promise<QuotationLineItem[]> {
    return db
      .update(quotationLineItems)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(quotationLineItems.id, id), eq(quotationLineItems.tenantId, tenantId)))
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<QuotationLineItem[]> {
    return db
      .delete(quotationLineItems)
      .where(and(eq(quotationLineItems.id, id), eq(quotationLineItems.tenantId, tenantId)))
      .returning();
  },

  async deleteByQuotationId(quotationId: string, tenantId: string): Promise<void> {
    await db
      .delete(quotationLineItems)
      .where(
        and(
          eq(quotationLineItems.quotationId, quotationId),
          eq(quotationLineItems.tenantId, tenantId),
        ),
      );
  },
};

// ─── Discount Policies Repository ──────────────────────────────────────────────

export const discountPoliciesRepository = {
  async findById(id: string, tenantId: string): Promise<DiscountPolicy | undefined> {
    return db.query.discountPolicies.findFirst({
      where: and(eq(discountPolicies.id, id), eq(discountPolicies.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      orderBy?: SQL;
      customerId?: string;
      type?: string;
    },
  ): Promise<PaginatedResult<DiscountPolicy>> {
    const {
      limit = 50,
      offset = 0,
      orderBy = asc(discountPolicies.validFrom),
      customerId,
      type,
    } = args ?? {};

    const conditions: SQL[] = [eq(discountPolicies.tenantId, tenantId)];
    if (customerId) conditions.push(eq(discountPolicies.customerId, customerId));
    if (type) conditions.push(eq(discountPolicies.type, type));

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    const data = await db.query.discountPolicies.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(discountPolicies).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async findActive(
    currentDate: string,
    tenantId: string,
    customerId?: string,
  ): Promise<DiscountPolicy[]> {
    const conditions: SQL[] = [
      eq(discountPolicies.tenantId, tenantId),
      lte(discountPolicies.validFrom, currentDate),
    ];
    if (customerId) {
      conditions.push(eq(discountPolicies.customerId, customerId));
    }
    return db.query.discountPolicies.findMany({
      where: and(...conditions),
      orderBy: asc(discountPolicies.validFrom),
    });
  },

  async create(data: NewDiscountPolicy, tenantId: string): Promise<DiscountPolicy[]> {
    return db
      .insert(discountPolicies)
      .values({ ...data, tenantId })
      .returning();
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewDiscountPolicy>,
  ): Promise<DiscountPolicy[]> {
    return db
      .update(discountPolicies)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(discountPolicies.id, id), eq(discountPolicies.tenantId, tenantId)))
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<DiscountPolicy[]> {
    return db
      .delete(discountPolicies)
      .where(and(eq(discountPolicies.id, id), eq(discountPolicies.tenantId, tenantId)))
      .returning();
  },
};
