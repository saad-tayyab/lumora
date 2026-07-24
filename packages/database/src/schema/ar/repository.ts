import { asc, count, eq, type SQL } from 'drizzle-orm';
import { db } from '../../index';
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
} from './schema';
import {
  creditNotes,
  customers,
  invoiceLineItems,
  invoices,
  paymentApplications,
  payments,
} from './schema';

// ─── Pagination Result Type ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Customers Repository ───────────────────────────────────────────────────────

export const customersRepository = {
  async findById(id: string): Promise<Customer | undefined> {
    return db.query.customers.findFirst({ where: eq(customers.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<Customer>> {
    const { limit = 50, offset = 0, orderBy = asc(customers.id) } = args ?? {};
    const data = await db.query.customers.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(customers);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewCustomer): Promise<Customer[]> {
    return db.insert(customers).values(data).returning();
  },

  async update(id: string, data: Partial<NewCustomer>): Promise<Customer[]> {
    return db.update(customers).set(data).where(eq(customers.id, id)).returning();
  },

  async delete(id: string): Promise<Customer[]> {
    return db.delete(customers).where(eq(customers.id, id)).returning();
  },

  async findActiveCustomers(): Promise<Customer[]> {
    return db.query.customers.findMany({
      where: eq(customers.isActive, true),
      orderBy: asc(customers.name),
    });
  },

  async findByEmail(email: string): Promise<Customer | undefined> {
    return db.query.customers.findFirst({ where: eq(customers.email, email) });
  },
};

// ─── Invoices Repository ────────────────────────────────────────────────────────

export const invoicesRepository = {
  async findById(id: string): Promise<Invoice | undefined> {
    return db.query.invoices.findFirst({ where: eq(invoices.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<Invoice>> {
    const { limit = 50, offset = 0, orderBy = asc(invoices.id) } = args ?? {};
    const data = await db.query.invoices.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(invoices);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewInvoice): Promise<Invoice[]> {
    return db.insert(invoices).values(data).returning();
  },

  async update(id: string, data: Partial<NewInvoice>): Promise<Invoice[]> {
    return db.update(invoices).set(data).where(eq(invoices.id, id)).returning();
  },

  async delete(id: string): Promise<Invoice[]> {
    return db.delete(invoices).where(eq(invoices.id, id)).returning();
  },

  async findByCustomerId(customerId: string): Promise<Invoice[]> {
    return db.query.invoices.findMany({
      where: eq(invoices.customerId, customerId),
      orderBy: asc(invoices.issueDate),
    });
  },

  async findByStatus(status: Invoice['status']): Promise<Invoice[]> {
    return db.query.invoices.findMany({
      where: eq(invoices.status, status),
      orderBy: asc(invoices.issueDate),
    });
  },

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    return db.query.invoices.findFirst({
      where: eq(invoices.invoiceNumber, invoiceNumber),
    });
  },

  async findOverdueInvoices(): Promise<Invoice[]> {
    return db.query.invoices.findMany({
      where: eq(invoices.status, 'overdue'),
      orderBy: asc(invoices.dueDate),
    });
  },
};

// ─── Invoice Line Items Repository ──────────────────────────────────────────────

export const invoiceLineItemsRepository = {
  async findById(id: string): Promise<InvoiceLineItem | undefined> {
    return db.query.invoiceLineItems.findFirst({
      where: eq(invoiceLineItems.id, id),
    });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<InvoiceLineItem>> {
    const { limit = 50, offset = 0, orderBy = asc(invoiceLineItems.sortOrder) } = args ?? {};
    const data = await db.query.invoiceLineItems.findMany({
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(invoiceLineItems);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewInvoiceLineItem): Promise<InvoiceLineItem[]> {
    return db.insert(invoiceLineItems).values(data).returning();
  },

  async update(id: string, data: Partial<NewInvoiceLineItem>): Promise<InvoiceLineItem[]> {
    return db.update(invoiceLineItems).set(data).where(eq(invoiceLineItems.id, id)).returning();
  },

  async delete(id: string): Promise<InvoiceLineItem[]> {
    return db.delete(invoiceLineItems).where(eq(invoiceLineItems.id, id)).returning();
  },

  async findByInvoiceId(invoiceId: string): Promise<InvoiceLineItem[]> {
    return db.query.invoiceLineItems.findMany({
      where: eq(invoiceLineItems.invoiceId, invoiceId),
      orderBy: asc(invoiceLineItems.sortOrder),
    });
  },

  async deleteByInvoiceId(invoiceId: string): Promise<void> {
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoiceId));
  },
};

// ─── Payments Repository ────────────────────────────────────────────────────────

export const paymentsRepository = {
  async findById(id: string): Promise<Payment | undefined> {
    return db.query.payments.findFirst({ where: eq(payments.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<Payment>> {
    const { limit = 50, offset = 0, orderBy = asc(payments.id) } = args ?? {};
    const data = await db.query.payments.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(payments);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewPayment): Promise<Payment[]> {
    return db.insert(payments).values(data).returning();
  },

  async update(id: string, data: Partial<NewPayment>): Promise<Payment[]> {
    return db.update(payments).set(data).where(eq(payments.id, id)).returning();
  },

  async delete(id: string): Promise<Payment[]> {
    return db.delete(payments).where(eq(payments.id, id)).returning();
  },

  async findByCustomerId(customerId: string): Promise<Payment[]> {
    return db.query.payments.findMany({
      where: eq(payments.customerId, customerId),
      orderBy: asc(payments.paymentDate),
    });
  },

  async findByPaymentMethod(method: Payment['paymentMethod']): Promise<Payment[]> {
    return db.query.payments.findMany({
      where: eq(payments.paymentMethod, method),
      orderBy: asc(payments.paymentDate),
    });
  },

  async findByPaymentNumber(paymentNumber: string): Promise<Payment | undefined> {
    return db.query.payments.findFirst({
      where: eq(payments.paymentNumber, paymentNumber),
    });
  },
};

// ─── Payment Applications Repository ────────────────────────────────────────────

export const paymentApplicationsRepository = {
  async findById(id: string): Promise<PaymentApplication | undefined> {
    return db.query.paymentApplications.findFirst({
      where: eq(paymentApplications.id, id),
    });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<PaymentApplication>> {
    const { limit = 50, offset = 0, orderBy = asc(paymentApplications.appliedDate) } = args ?? {};
    const data = await db.query.paymentApplications.findMany({
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(paymentApplications);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewPaymentApplication): Promise<PaymentApplication[]> {
    return db.insert(paymentApplications).values(data).returning();
  },

  async update(id: string, data: Partial<NewPaymentApplication>): Promise<PaymentApplication[]> {
    return db
      .update(paymentApplications)
      .set(data)
      .where(eq(paymentApplications.id, id))
      .returning();
  },

  async delete(id: string): Promise<PaymentApplication[]> {
    return db.delete(paymentApplications).where(eq(paymentApplications.id, id)).returning();
  },

  async findByPaymentId(paymentId: string): Promise<PaymentApplication[]> {
    return db.query.paymentApplications.findMany({
      where: eq(paymentApplications.paymentId, paymentId),
      orderBy: asc(paymentApplications.appliedDate),
    });
  },

  async findByInvoiceId(invoiceId: string): Promise<PaymentApplication[]> {
    return db.query.paymentApplications.findMany({
      where: eq(paymentApplications.invoiceId, invoiceId),
      orderBy: asc(paymentApplications.appliedDate),
    });
  },
};

// ─── Credit Notes Repository ────────────────────────────────────────────────────

export const creditNotesRepository = {
  async findById(id: string): Promise<CreditNote | undefined> {
    return db.query.creditNotes.findFirst({ where: eq(creditNotes.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<CreditNote>> {
    const { limit = 50, offset = 0, orderBy = asc(creditNotes.id) } = args ?? {};
    const data = await db.query.creditNotes.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(creditNotes);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewCreditNote): Promise<CreditNote[]> {
    return db.insert(creditNotes).values(data).returning();
  },

  async update(id: string, data: Partial<NewCreditNote>): Promise<CreditNote[]> {
    return db.update(creditNotes).set(data).where(eq(creditNotes.id, id)).returning();
  },

  async delete(id: string): Promise<CreditNote[]> {
    return db.delete(creditNotes).where(eq(creditNotes.id, id)).returning();
  },

  async findByCustomerId(customerId: string): Promise<CreditNote[]> {
    return db.query.creditNotes.findMany({
      where: eq(creditNotes.customerId, customerId),
      orderBy: asc(creditNotes.issueDate),
    });
  },

  async findByStatus(status: CreditNote['status']): Promise<CreditNote[]> {
    return db.query.creditNotes.findMany({
      where: eq(creditNotes.status, status),
      orderBy: asc(creditNotes.issueDate),
    });
  },

  async findByCreditNoteNumber(creditNoteNumber: string): Promise<CreditNote | undefined> {
    return db.query.creditNotes.findFirst({
      where: eq(creditNotes.creditNoteNumber, creditNoteNumber),
    });
  },
};
