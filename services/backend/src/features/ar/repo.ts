import type {
  CreditNote,
  Customer,
  Invoice,
  InvoiceLineItem,
  NewCreditNote,
  NewCustomer,
  NewInvoice,
  NewInvoiceLineItem,
  NewPayment,
  NewPaymentApplication,
  Payment,
  PaymentApplication,
} from '@lumora/database/schema';
import {
  creditNotes,
  customers,
  invoiceLineItems,
  invoices,
  paymentApplications,
  payments,
} from '@lumora/database/schema';
import { and, asc, count, eq, or, type SQL, sql } from 'drizzle-orm';
import { db } from '../../database';

// ─── Pagination Result Type ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Customers Repository ───────────────────────────────────────────────────────

export const customersRepository = {
  async findById(id: string, tenantId: string): Promise<Customer | undefined> {
    const [result] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
      .limit(1);
    return result;
  },

  async findMany(
    tenantId: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<PaginatedResult<Customer>> {
    const { limit = 50, offset = 0, orderBy = asc(customers.name) } = args ?? {};
    const where = eq(customers.tenantId, tenantId);
    const data = await db
      .select()
      .from(customers)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const total = await db.select({ count: count() }).from(customers).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewCustomer, tenantId: string): Promise<Customer[]> {
    return db
      .insert(customers)
      .values({ ...data, tenantId })
      .returning();
  },

  async update(id: string, tenantId: string, data: Partial<NewCustomer>): Promise<Customer[]> {
    return db
      .update(customers)
      .set(data)
      .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<Customer[]> {
    return db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
      .returning();
  },

  async findActiveCustomers(tenantId: string): Promise<Customer[]> {
    return db
      .select()
      .from(customers)
      .where(and(eq(customers.tenantId, tenantId), eq(customers.isActive, true)))
      .orderBy(asc(customers.name));
  },

  async findByEmail(email: string, tenantId: string): Promise<Customer | undefined> {
    const [result] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.email, email), eq(customers.tenantId, tenantId)))
      .limit(1);
    return result;
  },

  async countInvoices(customerId: string, tenantId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(invoices)
      .where(and(eq(invoices.customerId, customerId), eq(invoices.tenantId, tenantId)));
    return result[0].count;
  },
};

// ─── Invoices Repository ────────────────────────────────────────────────────────

export const invoicesRepository = {
  async findById(id: string, tenantId: string): Promise<Invoice | undefined> {
    const [result] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)))
      .limit(1);
    return result;
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
  ): Promise<PaginatedResult<Invoice>> {
    const {
      limit = 50,
      offset = 0,
      orderBy = asc(invoices.issueDate),
      customerId,
      status,
    } = args ?? {};

    const conditions: SQL[] = [eq(invoices.tenantId, tenantId)];
    if (customerId) conditions.push(eq(invoices.customerId, customerId));
    if (status) conditions.push(eq(invoices.status, status as Invoice['status']));

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    const data = await db
      .select()
      .from(invoices)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const total = await db.select({ count: count() }).from(invoices).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewInvoice, tenantId: string): Promise<Invoice[]> {
    return db
      .insert(invoices)
      .values({ ...data, tenantId })
      .returning();
  },

  async update(id: string, tenantId: string, data: Partial<NewInvoice>): Promise<Invoice[]> {
    return db
      .update(invoices)
      .set(data)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)))
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<Invoice[]> {
    return db
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)))
      .returning();
  },

  async findByCustomerId(customerId: string, tenantId: string): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(and(eq(invoices.customerId, customerId), eq(invoices.tenantId, tenantId)))
      .orderBy(asc(invoices.issueDate));
  },

  async findByStatus(status: Invoice['status'], tenantId: string): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(and(eq(invoices.status, status), eq(invoices.tenantId, tenantId)))
      .orderBy(asc(invoices.issueDate));
  },

  async findByInvoiceNumber(invoiceNumber: string, tenantId: string): Promise<Invoice | undefined> {
    const [result] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.invoiceNumber, invoiceNumber), eq(invoices.tenantId, tenantId)))
      .limit(1);
    return result;
  },

  async findOverdueInvoices(tenantId: string): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(and(eq(invoices.status, 'overdue'), eq(invoices.tenantId, tenantId)))
      .orderBy(asc(invoices.dueDate));
  },

  async sumBalanceDueByCustomer(customerId: string, tenantId: string): Promise<string> {
    const result = await db
      .select({
        total: sql`COALESCE(SUM(${invoices.balanceDue}), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.customerId, customerId),
          eq(invoices.tenantId, tenantId),
          or(
            eq(invoices.status, 'draft'),
            eq(invoices.status, 'sent'),
            eq(invoices.status, 'overdue'),
          ),
        ),
      );
    return String(result[0]?.total ?? '0');
  },
};

// ─── Invoice Line Items Repository ──────────────────────────────────────────────

export const invoiceLineItemsRepository = {
  async findById(id: string, tenantId: string): Promise<InvoiceLineItem | undefined> {
    const [result] = await db
      .select()
      .from(invoiceLineItems)
      .where(and(eq(invoiceLineItems.id, id), eq(invoiceLineItems.tenantId, tenantId)))
      .limit(1);
    return result;
  },

  async findByInvoiceId(invoiceId: string, tenantId: string): Promise<InvoiceLineItem[]> {
    return db
      .select()
      .from(invoiceLineItems)
      .where(
        and(
          eq(invoiceLineItems.invoiceId, invoiceId),
          eq(invoiceLineItems.tenantId, tenantId),
        ),
      )
      .orderBy(asc(invoiceLineItems.sortOrder));
  },

  async create(data: NewInvoiceLineItem, tenantId: string): Promise<InvoiceLineItem[]> {
    return db
      .insert(invoiceLineItems)
      .values({ ...data, tenantId })
      .returning();
  },

  async createMany(items: NewInvoiceLineItem[], tenantId: string): Promise<InvoiceLineItem[]> {
    const values = items.map((item) => ({ ...item, tenantId }));
    return db.insert(invoiceLineItems).values(values).returning();
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewInvoiceLineItem>,
  ): Promise<InvoiceLineItem[]> {
    return db
      .update(invoiceLineItems)
      .set(data)
      .where(and(eq(invoiceLineItems.id, id), eq(invoiceLineItems.tenantId, tenantId)))
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<InvoiceLineItem[]> {
    return db
      .delete(invoiceLineItems)
      .where(and(eq(invoiceLineItems.id, id), eq(invoiceLineItems.tenantId, tenantId)))
      .returning();
  },

  async deleteByInvoiceId(invoiceId: string, tenantId: string): Promise<void> {
    await db
      .delete(invoiceLineItems)
      .where(
        and(eq(invoiceLineItems.invoiceId, invoiceId), eq(invoiceLineItems.tenantId, tenantId)),
      );
  },
};

// ─── Payments Repository ────────────────────────────────────────────────────────

export const paymentsRepository = {
  async findById(id: string, tenantId: string): Promise<Payment | undefined> {
    const [result] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.id, id), eq(payments.tenantId, tenantId)))
      .limit(1);
    return result;
  },

  async findMany(
    tenantId: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<PaginatedResult<Payment>> {
    const { limit = 50, offset = 0, orderBy = asc(payments.paymentDate) } = args ?? {};
    const where = eq(payments.tenantId, tenantId);
    const data = await db
      .select()
      .from(payments)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const total = await db.select({ count: count() }).from(payments).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewPayment, tenantId: string): Promise<Payment[]> {
    return db
      .insert(payments)
      .values({ ...data, tenantId })
      .returning();
  },

  async update(id: string, tenantId: string, data: Partial<NewPayment>): Promise<Payment[]> {
    return db
      .update(payments)
      .set(data)
      .where(and(eq(payments.id, id), eq(payments.tenantId, tenantId)))
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<Payment[]> {
    return db
      .delete(payments)
      .where(and(eq(payments.id, id), eq(payments.tenantId, tenantId)))
      .returning();
  },

  async findByCustomerId(customerId: string, tenantId: string): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(and(eq(payments.customerId, customerId), eq(payments.tenantId, tenantId)))
      .orderBy(asc(payments.paymentDate));
  },

  async findByPaymentNumber(paymentNumber: string, tenantId: string): Promise<Payment | undefined> {
    const [result] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.paymentNumber, paymentNumber), eq(payments.tenantId, tenantId)))
      .limit(1);
    return result;
  },

  async sumAppliedByPaymentId(paymentId: string, tenantId: string): Promise<string> {
    const result = await db
      .select({
        total: sql`COALESCE(SUM(${paymentApplications.amountApplied}), 0)`,
      })
      .from(paymentApplications)
      .where(
        and(
          eq(paymentApplications.paymentId, paymentId),
          eq(paymentApplications.tenantId, tenantId),
        ),
      );
    return String(result[0]?.total ?? '0');
  },
};

// ─── Payment Applications Repository ────────────────────────────────────────────

export const paymentApplicationsRepository = {
  async findById(id: string, tenantId: string): Promise<PaymentApplication | undefined> {
    const [result] = await db
      .select()
      .from(paymentApplications)
      .where(and(eq(paymentApplications.id, id), eq(paymentApplications.tenantId, tenantId)))
      .limit(1);
    return result;
  },

  async findByPaymentId(paymentId: string, tenantId: string): Promise<PaymentApplication[]> {
    return db
      .select()
      .from(paymentApplications)
      .where(
        and(
          eq(paymentApplications.paymentId, paymentId),
          eq(paymentApplications.tenantId, tenantId),
        ),
      )
      .orderBy(asc(paymentApplications.appliedDate));
  },

  async findByInvoiceId(invoiceId: string, tenantId: string): Promise<PaymentApplication[]> {
    return db
      .select()
      .from(paymentApplications)
      .where(
        and(
          eq(paymentApplications.invoiceId, invoiceId),
          eq(paymentApplications.tenantId, tenantId),
        ),
      )
      .orderBy(asc(paymentApplications.appliedDate));
  },

  async create(data: NewPaymentApplication, tenantId: string): Promise<PaymentApplication[]> {
    return db
      .insert(paymentApplications)
      .values({ ...data, tenantId })
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<PaymentApplication[]> {
    return db
      .delete(paymentApplications)
      .where(and(eq(paymentApplications.id, id), eq(paymentApplications.tenantId, tenantId)))
      .returning();
  },

  async sumAppliedByInvoiceId(invoiceId: string, tenantId: string): Promise<string> {
    const result = await db
      .select({
        total: sql`COALESCE(SUM(${paymentApplications.amountApplied}), 0)`,
      })
      .from(paymentApplications)
      .where(
        and(
          eq(paymentApplications.invoiceId, invoiceId),
          eq(paymentApplications.tenantId, tenantId),
        ),
      );
    return String(result[0]?.total ?? '0');
  },
};

// ─── Credit Notes Repository ────────────────────────────────────────────────────

export const creditNotesRepository = {
  async findById(id: string, tenantId: string): Promise<CreditNote | undefined> {
    const [result] = await db
      .select()
      .from(creditNotes)
      .where(and(eq(creditNotes.id, id), eq(creditNotes.tenantId, tenantId)))
      .limit(1);
    return result;
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
  ): Promise<PaginatedResult<CreditNote>> {
    const {
      limit = 50,
      offset = 0,
      orderBy = asc(creditNotes.issueDate),
      customerId,
      status,
    } = args ?? {};

    const conditions: SQL[] = [eq(creditNotes.tenantId, tenantId)];
    if (customerId) conditions.push(eq(creditNotes.customerId, customerId));
    if (status) conditions.push(eq(creditNotes.status, status as CreditNote['status']));

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    const data = await db
      .select()
      .from(creditNotes)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const total = await db.select({ count: count() }).from(creditNotes).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewCreditNote, tenantId: string): Promise<CreditNote[]> {
    return db
      .insert(creditNotes)
      .values({ ...data, tenantId })
      .returning();
  },

  async update(id: string, tenantId: string, data: Partial<NewCreditNote>): Promise<CreditNote[]> {
    return db
      .update(creditNotes)
      .set(data)
      .where(and(eq(creditNotes.id, id), eq(creditNotes.tenantId, tenantId)))
      .returning();
  },

  async delete(id: string, tenantId: string): Promise<CreditNote[]> {
    return db
      .delete(creditNotes)
      .where(and(eq(creditNotes.id, id), eq(creditNotes.tenantId, tenantId)))
      .returning();
  },

  async findByCustomerId(customerId: string, tenantId: string): Promise<CreditNote[]> {
    return db
      .select()
      .from(creditNotes)
      .where(and(eq(creditNotes.customerId, customerId), eq(creditNotes.tenantId, tenantId)))
      .orderBy(asc(creditNotes.issueDate));
  },

  async findByCreditNoteNumber(
    creditNoteNumber: string,
    tenantId: string,
  ): Promise<CreditNote | undefined> {
    const [result] = await db
      .select()
      .from(creditNotes)
      .where(
        and(
          eq(creditNotes.creditNoteNumber, creditNoteNumber),
          eq(creditNotes.tenantId, tenantId),
        ),
      )
      .limit(1);
    return result;
  },
};
