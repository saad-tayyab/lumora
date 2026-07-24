import { and, asc, count, eq, gte, isNull, lte, or, type SQL } from 'drizzle-orm';

import { db } from '../../index';
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
} from './schema';
import {
  discountPolicies,
  quotationLineItems,
  quotations,
  salesOrderLineItems,
  salesOrders,
} from './schema';

// ─── FindMany args ────────────────────────────────────────────────────────────

export type FindManyArgs = {
  limit?: number;
  offset?: number;
  orderBy?: SQL;
};

// ─── Sales Orders ─────────────────────────────────────────────────────────────

export const salesOrdersRepository = {
  async findById(id: string): Promise<SalesOrder | undefined> {
    return db.query.salesOrders.findFirst({ where: eq(salesOrders.id, id) });
  },

  async findByOrderNumber(orderNumber: string): Promise<SalesOrder | undefined> {
    return db.query.salesOrders.findFirst({
      where: eq(salesOrders.orderNumber, orderNumber),
    });
  },

  async findByCustomerId(
    customerId: string,
    args?: FindManyArgs,
  ): Promise<{ data: SalesOrder[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(salesOrders.orderDate) } = args ?? {};
    const data = await db.query.salesOrders.findMany({
      where: eq(salesOrders.customerId, customerId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(salesOrders)
      .where(eq(salesOrders.customerId, customerId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByStatus(
    status: SalesOrder['status'],
    args?: FindManyArgs,
  ): Promise<{ data: SalesOrder[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(salesOrders.orderDate) } = args ?? {};
    const data = await db.query.salesOrders.findMany({
      where: eq(salesOrders.status, status),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(salesOrders)
      .where(eq(salesOrders.status, status));
    return { data, total: total[0].count, limit, offset };
  },

  async findByOrderDateRange(
    startDate: string,
    endDate: string,
    args?: FindManyArgs,
  ): Promise<{ data: SalesOrder[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(salesOrders.orderDate) } = args ?? {};
    const condition = and(
      gte(salesOrders.orderDate, startDate),
      lte(salesOrders.orderDate, endDate),
    );
    const data = await db.query.salesOrders.findMany({
      where: condition,
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(salesOrders).where(condition);
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: SalesOrder[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(salesOrders.id) } = args ?? {};
    const data = await db.query.salesOrders.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(salesOrders);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewSalesOrder): Promise<SalesOrder[]> {
    return db.insert(salesOrders).values(data).returning();
  },

  async update(id: string, data: Partial<NewSalesOrder>): Promise<SalesOrder[]> {
    return db.update(salesOrders).set(data).where(eq(salesOrders.id, id)).returning();
  },

  async delete(id: string): Promise<SalesOrder[]> {
    return db.delete(salesOrders).where(eq(salesOrders.id, id)).returning();
  },
};

// ─── Sales Order Line Items ───────────────────────────────────────────────────

export const salesOrderLineItemsRepository = {
  async findById(id: string): Promise<SalesOrderLineItem | undefined> {
    return db.query.salesOrderLineItems.findFirst({
      where: eq(salesOrderLineItems.id, id),
    });
  },

  async findBySalesOrderId(
    salesOrderId: string,
    args?: FindManyArgs,
  ): Promise<{
    data: SalesOrderLineItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(salesOrderLineItems.id) } = args ?? {};
    const data = await db.query.salesOrderLineItems.findMany({
      where: eq(salesOrderLineItems.salesOrderId, salesOrderId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(salesOrderLineItems)
      .where(eq(salesOrderLineItems.salesOrderId, salesOrderId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByItemId(
    itemId: string,
    args?: FindManyArgs,
  ): Promise<{
    data: SalesOrderLineItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(salesOrderLineItems.id) } = args ?? {};
    const data = await db.query.salesOrderLineItems.findMany({
      where: eq(salesOrderLineItems.itemId, itemId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(salesOrderLineItems)
      .where(eq(salesOrderLineItems.itemId, itemId));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: SalesOrderLineItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(salesOrderLineItems.id) } = args ?? {};
    const data = await db.query.salesOrderLineItems.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(salesOrderLineItems);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewSalesOrderLineItem): Promise<SalesOrderLineItem[]> {
    return db.insert(salesOrderLineItems).values(data).returning();
  },

  async update(id: string, data: Partial<NewSalesOrderLineItem>): Promise<SalesOrderLineItem[]> {
    return db
      .update(salesOrderLineItems)
      .set(data)
      .where(eq(salesOrderLineItems.id, id))
      .returning();
  },

  async delete(id: string): Promise<SalesOrderLineItem[]> {
    return db.delete(salesOrderLineItems).where(eq(salesOrderLineItems.id, id)).returning();
  },

  async deleteBySalesOrderId(salesOrderId: string): Promise<SalesOrderLineItem[]> {
    return db
      .delete(salesOrderLineItems)
      .where(eq(salesOrderLineItems.salesOrderId, salesOrderId))
      .returning();
  },
};

// ─── Quotations ───────────────────────────────────────────────────────────────

export const quotationsRepository = {
  async findById(id: string): Promise<Quotation | undefined> {
    return db.query.quotations.findFirst({ where: eq(quotations.id, id) });
  },

  async findByQuotationNumber(quotationNumber: string): Promise<Quotation | undefined> {
    return db.query.quotations.findFirst({
      where: eq(quotations.quotationNumber, quotationNumber),
    });
  },

  async findByCustomerId(
    customerId: string,
    args?: FindManyArgs,
  ): Promise<{ data: Quotation[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(quotations.issueDate) } = args ?? {};
    const data = await db.query.quotations.findMany({
      where: eq(quotations.customerId, customerId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(quotations)
      .where(eq(quotations.customerId, customerId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByStatus(
    status: Quotation['status'],
    args?: FindManyArgs,
  ): Promise<{ data: Quotation[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(quotations.issueDate) } = args ?? {};
    const data = await db.query.quotations.findMany({
      where: eq(quotations.status, status),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(quotations)
      .where(eq(quotations.status, status));
    return { data, total: total[0].count, limit, offset };
  },

  async findExpired(
    date: string,
    args?: FindManyArgs,
  ): Promise<{
    data: Quotation[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(quotations.expiryDate) } = args ?? {};
    const condition = and(eq(quotations.status, 'sent'), lte(quotations.expiryDate, date));
    const data = await db.query.quotations.findMany({
      where: condition,
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(quotations).where(condition);
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: Quotation[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(quotations.id) } = args ?? {};
    const data = await db.query.quotations.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(quotations);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewQuotation): Promise<Quotation[]> {
    return db.insert(quotations).values(data).returning();
  },

  async update(id: string, data: Partial<NewQuotation>): Promise<Quotation[]> {
    return db.update(quotations).set(data).where(eq(quotations.id, id)).returning();
  },

  async delete(id: string): Promise<Quotation[]> {
    return db.delete(quotations).where(eq(quotations.id, id)).returning();
  },
};

// ─── Quotation Line Items ─────────────────────────────────────────────────────

export const quotationLineItemsRepository = {
  async findById(id: string): Promise<QuotationLineItem | undefined> {
    return db.query.quotationLineItems.findFirst({
      where: eq(quotationLineItems.id, id),
    });
  },

  async findByQuotationId(
    quotationId: string,
    args?: FindManyArgs,
  ): Promise<{
    data: QuotationLineItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(quotationLineItems.id) } = args ?? {};
    const data = await db.query.quotationLineItems.findMany({
      where: eq(quotationLineItems.quotationId, quotationId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(quotationLineItems)
      .where(eq(quotationLineItems.quotationId, quotationId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByItemId(
    itemId: string,
    args?: FindManyArgs,
  ): Promise<{
    data: QuotationLineItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(quotationLineItems.id) } = args ?? {};
    const data = await db.query.quotationLineItems.findMany({
      where: eq(quotationLineItems.itemId, itemId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(quotationLineItems)
      .where(eq(quotationLineItems.itemId, itemId));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: QuotationLineItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(quotationLineItems.id) } = args ?? {};
    const data = await db.query.quotationLineItems.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(quotationLineItems);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewQuotationLineItem): Promise<QuotationLineItem[]> {
    return db.insert(quotationLineItems).values(data).returning();
  },

  async update(id: string, data: Partial<NewQuotationLineItem>): Promise<QuotationLineItem[]> {
    return db.update(quotationLineItems).set(data).where(eq(quotationLineItems.id, id)).returning();
  },

  async delete(id: string): Promise<QuotationLineItem[]> {
    return db.delete(quotationLineItems).where(eq(quotationLineItems.id, id)).returning();
  },

  async deleteByQuotationId(quotationId: string): Promise<QuotationLineItem[]> {
    return db
      .delete(quotationLineItems)
      .where(eq(quotationLineItems.quotationId, quotationId))
      .returning();
  },
};

// ─── Discount Policies ────────────────────────────────────────────────────────

export const discountPoliciesRepository = {
  async findById(id: string): Promise<DiscountPolicy | undefined> {
    return db.query.discountPolicies.findFirst({
      where: eq(discountPolicies.id, id),
    });
  },

  async findByCustomerId(
    customerId: string,
    args?: FindManyArgs,
  ): Promise<{ data: DiscountPolicy[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(discountPolicies.validFrom) } = args ?? {};
    const data = await db.query.discountPolicies.findMany({
      where: eq(discountPolicies.customerId, customerId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(discountPolicies)
      .where(eq(discountPolicies.customerId, customerId));
    return { data, total: total[0].count, limit, offset };
  },

  async findActive(
    currentDate: string,
    customerId: string | undefined,
    args?: FindManyArgs,
  ): Promise<{ data: DiscountPolicy[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(discountPolicies.validFrom) } = args ?? {};
    const expiryCondition: SQL = or(
      isNull(discountPolicies.validUntil),
      gte(discountPolicies.validUntil, currentDate),
    ) as SQL;
    const conditions: SQL[] = [lte(discountPolicies.validFrom, currentDate), expiryCondition];
    if (customerId) {
      conditions.push(eq(discountPolicies.customerId, customerId));
    }
    const condition = and(...conditions);
    const data = await db.query.discountPolicies.findMany({
      where: condition,
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(discountPolicies).where(condition);
    return { data, total: total[0].count, limit, offset };
  },

  async findByType(
    type: string,
    args?: FindManyArgs,
  ): Promise<{ data: DiscountPolicy[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(discountPolicies.validFrom) } = args ?? {};
    const data = await db.query.discountPolicies.findMany({
      where: eq(discountPolicies.type, type),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(discountPolicies)
      .where(eq(discountPolicies.type, type));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: DiscountPolicy[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(discountPolicies.id) } = args ?? {};
    const data = await db.query.discountPolicies.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(discountPolicies);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewDiscountPolicy): Promise<DiscountPolicy[]> {
    return db.insert(discountPolicies).values(data).returning();
  },

  async update(id: string, data: Partial<NewDiscountPolicy>): Promise<DiscountPolicy[]> {
    return db.update(discountPolicies).set(data).where(eq(discountPolicies.id, id)).returning();
  },

  async delete(id: string): Promise<DiscountPolicy[]> {
    return db.delete(discountPolicies).where(eq(discountPolicies.id, id)).returning();
  },
};
