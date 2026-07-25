import {
  CreditNoteAmountExceedsBalanceError,
  CreditNoteDuplicateNumberError,
  CreditNoteNotFoundError,
  CreditNoteStatusTransitionError,
  CustomerDuplicateEmailError,
  CustomerHasOutstandingInvoicesError,
  CustomerNotFoundError,
  InvoiceAlreadyPaidError,
  InvoiceAlreadyVoidedError,
  InvoiceDuplicateNumberError,
  InvoiceLineItemRequiredError,
  InvoiceNotFoundError,
  InvoiceStatusTransitionError,
  PaymentAlreadyFullyAppliedError,
  PaymentAmountExceedsInvoiceBalanceError,
  PaymentApplicationNotFoundError,
  PaymentDuplicateNumberError,
  PaymentNotFoundError,
} from './errors';
import { invoiceCreated } from './events';
import {
  creditNotesRepository,
  customersRepository,
  invoiceLineItemsRepository,
  invoicesRepository,
  type PaginatedResult,
  paymentApplicationsRepository,
  paymentsRepository,
} from './repo';
import type {
  ApplyCreditNoteRequest,
  CreateCreditNoteRequest,
  CreateCustomerRequest,
  CreateInvoiceRequest,
  CreatePaymentApplicationRequest,
  CreatePaymentRequest,
  CreditNote,
  Customer,
  Invoice,
  InvoiceLineItem,
  InvoiceQuery,
  PaginationParams,
  Payment,
  PaymentApplication,
  UpdateCustomerRequest,
  UpdateInvoiceRequest,
  UpdatePaymentRequest,
} from './types';

// ─── Decimal Arithmetic Helpers ────────────────────────────────────────────────
// All monetary values are stored as decimal strings (precision 19, scale 4).
// Using Number() for intermediate calculations; results are rounded to 4 decimal places.
// For production-grade decimal arithmetic, consider a library like `decimal.js`.

function decimalAdd(a: string, b: string): string {
  return (Number(a) + Number(b)).toFixed(4);
}

function decimalSubtract(a: string, b: string): string {
  return (Number(a) - Number(b)).toFixed(4);
}

function decimalMultiply(a: string, b: string): string {
  return (Number(a) * Number(b)).toFixed(4);
}

// ─── Valid Status Transitions ──────────────────────────────────────────────────

const INVOICE_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'voided'],
  sent: ['paid', 'overdue', 'voided'],
  overdue: ['paid', 'voided'],
  paid: [],
  voided: [],
};

const CREDIT_NOTE_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['issued', 'voided'],
  issued: ['applied', 'voided'],
  applied: [],
  voided: [],
};

// ─── Customer Service ──────────────────────────────────────────────────────────

export async function listCustomers(
  tenantId: string,
  pagination: PaginationParams,
): Promise<PaginatedResult<Customer>> {
  return customersRepository.findMany(tenantId, {
    limit: pagination.limit,
    offset: pagination.offset,
  });
}

export async function getCustomer(id: string, tenantId: string): Promise<Customer> {
  const customer = await customersRepository.findById(id, tenantId);
  if (!customer) {
    throw new CustomerNotFoundError(id);
  }
  return customer;
}

export async function createCustomer(
  data: CreateCustomerRequest,
  tenantId: string,
): Promise<Customer> {
  if (data.email) {
    const existing = await customersRepository.findByEmail(data.email, tenantId);
    if (existing) {
      throw new CustomerDuplicateEmailError(data.email);
    }
  }

  const results = await customersRepository.create(
    {
      name: data.name,
      email: data.email,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      paymentTerms: data.paymentTerms,
      creditLimit: data.creditLimit,
      isActive: data.isActive,
    },
    tenantId,
  );

  return results[0];
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerRequest,
  tenantId: string,
): Promise<Customer> {
  const existing = await customersRepository.findById(id, tenantId);
  if (!existing) {
    throw new CustomerNotFoundError(id);
  }

  if (data.email && data.email !== existing.email) {
    const duplicate = await customersRepository.findByEmail(data.email, tenantId);
    if (duplicate) {
      throw new CustomerDuplicateEmailError(data.email);
    }
  }

  const results = await customersRepository.update(id, tenantId, {
    name: data.name,
    email: data.email,
    phone: data.phone,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
    paymentTerms: data.paymentTerms,
    creditLimit: data.creditLimit,
    isActive: data.isActive,
  });

  if (results.length === 0) {
    throw new CustomerNotFoundError(id);
  }

  return results[0];
}

export async function deleteCustomer(id: string, tenantId: string): Promise<void> {
  const customer = await customersRepository.findById(id, tenantId);
  if (!customer) {
    throw new CustomerNotFoundError(id);
  }

  const invoiceCount = await customersRepository.countInvoices(id, tenantId);
  if (invoiceCount > 0) {
    throw new CustomerHasOutstandingInvoicesError(id);
  }

  await customersRepository.delete(id, tenantId);
}

// ─── Invoice Service ───────────────────────────────────────────────────────────

function calculateLineItemAmount(quantity: string, unitPrice: string): string {
  return decimalMultiply(quantity, unitPrice);
}

function calculateLineItemTax(amount: string, taxRate?: string | null): string {
  if (!taxRate) return '0';
  return decimalMultiply(amount, taxRate);
}

function recalculateInvoiceTotals(lineItems: { amount: string; taxAmount?: string | null }[]): {
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
} {
  let subtotal = '0';
  let taxAmount = '0';

  for (const item of lineItems) {
    subtotal = decimalAdd(subtotal, item.amount);
    taxAmount = decimalAdd(taxAmount, item.taxAmount ?? '0');
  }

  const totalAmount = decimalAdd(subtotal, taxAmount);

  return { subtotal, taxAmount, totalAmount };
}

export async function listInvoices(
  tenantId: string,
  query: InvoiceQuery,
): Promise<PaginatedResult<Invoice>> {
  return invoicesRepository.findMany(tenantId, {
    limit: query.limit,
    offset: query.offset,
    customerId: query.customerId,
    status: query.status,
  });
}

export async function getInvoice(id: string, tenantId: string): Promise<Invoice> {
  const invoice = await invoicesRepository.findById(id, tenantId);
  if (!invoice) {
    throw new InvoiceNotFoundError(id);
  }
  return invoice;
}

export async function getInvoiceLineItems(
  invoiceId: string,
  tenantId: string,
): Promise<InvoiceLineItem[]> {
  const invoice = await invoicesRepository.findById(invoiceId, tenantId);
  if (!invoice) {
    throw new InvoiceNotFoundError(invoiceId);
  }
  return invoiceLineItemsRepository.findByInvoiceId(invoiceId, tenantId);
}

export async function createInvoice(
  data: CreateInvoiceRequest,
  tenantId: string,
): Promise<Invoice> {
  // Validate customer exists
  const customer = await customersRepository.findById(data.customerId, tenantId);
  if (!customer) {
    throw new CustomerNotFoundError(data.customerId);
  }

  // Validate invoice number uniqueness
  const existingInvoice = await invoicesRepository.findByInvoiceNumber(
    data.invoiceNumber,
    tenantId,
  );
  if (existingInvoice) {
    throw new InvoiceDuplicateNumberError(data.invoiceNumber);
  }

  // Validate line items
  if (!data.lineItems || data.lineItems.length === 0) {
    throw new InvoiceLineItemRequiredError();
  }

  // Calculate line items
  const lineItemData = data.lineItems.map((item, index) => {
    const amount = calculateLineItemAmount(item.quantity, item.unitPrice);
    const taxAmount = calculateLineItemTax(amount, item.taxRate);
    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount,
      taxRate: item.taxRate,
      taxAmount,
      sortOrder: item.sortOrder ?? index,
    };
  });

  // Calculate totals
  const { subtotal, taxAmount, totalAmount } = recalculateInvoiceTotals(lineItemData);

  // Create invoice
  const [invoice] = await invoicesRepository.create(
    {
      customerId: data.customerId,
      invoiceNumber: data.invoiceNumber,
      status: 'draft',
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotal,
      taxAmount,
      totalAmount,
      amountPaid: '0',
      balanceDue: totalAmount,
      currency: data.currency,
      notes: data.notes,
    },
    tenantId,
  );

  // Create line items
  await invoiceLineItemsRepository.createMany(
    lineItemData.map((item) => ({
      invoiceId: invoice.id,
      ...item,
    })),
    tenantId,
  );

  await invoiceCreated.publish({
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    tenantId,
  });

  return invoice;
}

export async function updateInvoice(
  id: string,
  data: UpdateInvoiceRequest,
  tenantId: string,
): Promise<Invoice> {
  const existing = await invoicesRepository.findById(id, tenantId);
  if (!existing) {
    throw new InvoiceNotFoundError(id);
  }

  // Only draft invoices can be edited
  if (existing.status !== 'draft') {
    throw new InvoiceStatusTransitionError(id, existing.status, 'edit');
  }

  // Update invoice header
  const updateData: Record<string, unknown> = {};
  if (data.customerId) updateData.customerId = data.customerId;
  if (data.issueDate) updateData.issueDate = data.issueDate;
  if (data.dueDate) updateData.dueDate = data.dueDate;
  if (data.currency) updateData.currency = data.currency;
  if (data.notes !== undefined) updateData.notes = data.notes;

  // Recalculate if line items changed
  if (data.lineItems) {
    if (data.lineItems.length === 0) {
      throw new InvoiceLineItemRequiredError();
    }

    // Delete existing line items and recreate
    await invoiceLineItemsRepository.deleteByInvoiceId(id, tenantId);

    const lineItemData = data.lineItems.map((item, index) => {
      const amount = calculateLineItemAmount(item.quantity, item.unitPrice);
      const taxAmount = calculateLineItemTax(amount, item.taxRate);
      return {
        invoiceId: id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount,
        taxRate: item.taxRate,
        taxAmount,
        sortOrder: item.sortOrder ?? index,
      };
    });

    await invoiceLineItemsRepository.createMany(lineItemData, tenantId);

    const { subtotal, taxAmount, totalAmount } = recalculateInvoiceTotals(lineItemData);
    updateData.subtotal = subtotal;
    updateData.taxAmount = taxAmount;
    updateData.totalAmount = totalAmount;
    updateData.balanceDue = decimalSubtract(totalAmount, existing.amountPaid);
  }

  const results = await invoicesRepository.update(id, tenantId, updateData);
  if (results.length === 0) {
    throw new InvoiceNotFoundError(id);
  }

  return results[0];
}

export async function updateInvoiceStatus(
  id: string,
  status: string,
  tenantId: string,
): Promise<Invoice> {
  const existing = await invoicesRepository.findById(id, tenantId);
  if (!existing) {
    throw new InvoiceNotFoundError(id);
  }

  if (existing.status === 'voided') {
    throw new InvoiceAlreadyVoidedError(id);
  }

  if (existing.status === 'paid') {
    throw new InvoiceAlreadyPaidError(id);
  }

  const allowed = INVOICE_STATUS_TRANSITIONS[existing.status];
  if (!allowed?.includes(status)) {
    throw new InvoiceStatusTransitionError(id, existing.status, status);
  }

  const results = await invoicesRepository.update(id, tenantId, { status });
  if (results.length === 0) {
    throw new InvoiceNotFoundError(id);
  }

  return results[0];
}

// ─── Payment Service ───────────────────────────────────────────────────────────

export async function listPayments(
  tenantId: string,
  pagination: PaginationParams,
): Promise<PaginatedResult<Payment>> {
  return paymentsRepository.findMany(tenantId, {
    limit: pagination.limit,
    offset: pagination.offset,
  });
}

export async function getPayment(id: string, tenantId: string): Promise<Payment> {
  const payment = await paymentsRepository.findById(id, tenantId);
  if (!payment) {
    throw new PaymentNotFoundError(id);
  }
  return payment;
}

export async function createPayment(
  data: CreatePaymentRequest,
  tenantId: string,
): Promise<Payment> {
  // Validate customer exists
  const customer = await customersRepository.findById(data.customerId, tenantId);
  if (!customer) {
    throw new CustomerNotFoundError(data.customerId);
  }

  // Validate payment number uniqueness
  const existingPayment = await paymentsRepository.findByPaymentNumber(
    data.paymentNumber,
    tenantId,
  );
  if (existingPayment) {
    throw new PaymentDuplicateNumberError(data.paymentNumber);
  }

  const results = await paymentsRepository.create(
    {
      customerId: data.customerId,
      paymentNumber: data.paymentNumber,
      paymentDate: data.paymentDate,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      bankAccountId: data.bankAccountId,
      currency: data.currency,
      notes: data.notes,
    },
    tenantId,
  );

  return results[0];
}

export async function updatePayment(
  id: string,
  data: UpdatePaymentRequest,
  tenantId: string,
): Promise<Payment> {
  const existing = await paymentsRepository.findById(id, tenantId);
  if (!existing) {
    throw new PaymentNotFoundError(id);
  }

  // Check if payment already has applications
  const applications = await paymentApplicationsRepository.findByPaymentId(id, tenantId);
  if (applications.length > 0) {
    // If amount is changing and there are applications, check it doesn't go below applied
    if (data.amount) {
      const totalApplied = await paymentsRepository.sumAppliedByPaymentId(id, tenantId);
      if (Number(data.amount) < Number(totalApplied)) {
        throw new PaymentAmountExceedsInvoiceBalanceError(id, data.amount, totalApplied);
      }
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.paymentDate) updateData.paymentDate = data.paymentDate;
  if (data.amount) updateData.amount = data.amount;
  if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
  if (data.referenceNumber !== undefined) updateData.referenceNumber = data.referenceNumber;
  if (data.bankAccountId !== undefined) updateData.bankAccountId = data.bankAccountId;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const results = await paymentsRepository.update(id, tenantId, updateData);
  if (results.length === 0) {
    throw new PaymentNotFoundError(id);
  }

  return results[0];
}

// ─── Payment Application Service ───────────────────────────────────────────────

async function updateInvoicePaidAmount(invoiceId: string, tenantId: string): Promise<void> {
  const totalApplied = await paymentApplicationsRepository.sumAppliedByInvoiceId(
    invoiceId,
    tenantId,
  );
  const invoice = await invoicesRepository.findById(invoiceId, tenantId);
  if (!invoice) return;

  const balanceDue = decimalSubtract(invoice.totalAmount, totalApplied);
  const newStatus = Number(balanceDue) <= 0 ? 'paid' : invoice.status;

  await invoicesRepository.update(invoiceId, tenantId, {
    amountPaid: totalApplied,
    balanceDue,
    status: newStatus,
  });
}

export async function createPaymentApplication(
  data: CreatePaymentApplicationRequest,
  tenantId: string,
): Promise<PaymentApplication> {
  // Validate payment exists
  const payment = await paymentsRepository.findById(data.paymentId, tenantId);
  if (!payment) {
    throw new PaymentNotFoundError(data.paymentId);
  }

  // Validate invoice exists
  const invoice = await invoicesRepository.findById(data.invoiceId, tenantId);
  if (!invoice) {
    throw new InvoiceNotFoundError(data.invoiceId);
  }

  // Check payment is not fully applied
  const totalPaymentApplied = await paymentsRepository.sumAppliedByPaymentId(
    data.paymentId,
    tenantId,
  );
  const paymentRemaining = decimalSubtract(payment.amount, totalPaymentApplied);
  if (Number(paymentRemaining) <= 0) {
    throw new PaymentAlreadyFullyAppliedError(data.paymentId);
  }

  // Check application amount does not exceed payment remaining
  if (Number(data.amountApplied) > Number(paymentRemaining)) {
    throw new PaymentAmountExceedsInvoiceBalanceError(
      data.paymentId,
      data.amountApplied,
      paymentRemaining,
    );
  }

  // Check application amount does not exceed invoice balance
  if (Number(data.amountApplied) > Number(invoice.balanceDue)) {
    throw new PaymentAmountExceedsInvoiceBalanceError(
      data.paymentId,
      data.amountApplied,
      invoice.balanceDue,
    );
  }

  const results = await paymentApplicationsRepository.create(
    {
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
      amountApplied: data.amountApplied,
      appliedDate: data.appliedDate,
    },
    tenantId,
  );

  // Update invoice paid amount and status
  await updateInvoicePaidAmount(data.invoiceId, tenantId);

  return results[0];
}

export async function deletePaymentApplication(id: string, tenantId: string): Promise<void> {
  const application = await paymentApplicationsRepository.findById(id, tenantId);
  if (!application) {
    throw new PaymentApplicationNotFoundError(id);
  }

  const invoiceId = application.invoiceId;

  await paymentApplicationsRepository.delete(id, tenantId);

  // Update invoice paid amount and status
  await updateInvoicePaidAmount(invoiceId, tenantId);
}

// ─── Credit Note Service ───────────────────────────────────────────────────────

export async function listCreditNotes(
  tenantId: string,
  query: { customerId?: string; status?: string } & PaginationParams,
): Promise<PaginatedResult<CreditNote>> {
  return creditNotesRepository.findMany(tenantId, {
    limit: query.limit,
    offset: query.offset,
    customerId: query.customerId,
    status: query.status,
  });
}

export async function getCreditNote(id: string, tenantId: string): Promise<CreditNote> {
  const creditNote = await creditNotesRepository.findById(id, tenantId);
  if (!creditNote) {
    throw new CreditNoteNotFoundError(id);
  }
  return creditNote;
}

export async function createCreditNote(
  data: CreateCreditNoteRequest,
  tenantId: string,
): Promise<CreditNote> {
  // Validate customer exists
  const customer = await customersRepository.findById(data.customerId, tenantId);
  if (!customer) {
    throw new CustomerNotFoundError(data.customerId);
  }

  // Validate credit note number uniqueness
  const existing = await creditNotesRepository.findByCreditNoteNumber(
    data.creditNoteNumber,
    tenantId,
  );
  if (existing) {
    throw new CreditNoteDuplicateNumberError(data.creditNoteNumber);
  }

  const results = await creditNotesRepository.create(
    {
      customerId: data.customerId,
      creditNoteNumber: data.creditNoteNumber,
      status: 'draft',
      issueDate: data.issueDate,
      reason: data.reason,
      amount: data.amount,
      amountApplied: '0',
      balance: data.amount,
      currency: data.currency,
      notes: data.notes,
    },
    tenantId,
  );

  return results[0];
}

export async function updateCreditNoteStatus(
  id: string,
  status: string,
  tenantId: string,
): Promise<CreditNote> {
  const existing = await creditNotesRepository.findById(id, tenantId);
  if (!existing) {
    throw new CreditNoteNotFoundError(id);
  }

  if (existing.status === 'voided') {
    throw new CreditNoteStatusTransitionError(id, existing.status, status);
  }

  if (existing.status === 'applied') {
    throw new CreditNoteStatusTransitionError(id, existing.status, status);
  }

  const allowed = CREDIT_NOTE_STATUS_TRANSITIONS[existing.status];
  if (!allowed?.includes(status)) {
    throw new CreditNoteStatusTransitionError(id, existing.status, status);
  }

  const results = await creditNotesRepository.update(id, tenantId, { status });
  if (results.length === 0) {
    throw new CreditNoteNotFoundError(id);
  }

  return results[0];
}

export async function applyCreditNote(
  creditNoteId: string,
  data: ApplyCreditNoteRequest,
  tenantId: string,
): Promise<void> {
  const creditNote = await creditNotesRepository.findById(creditNoteId, tenantId);
  if (!creditNote) {
    throw new CreditNoteNotFoundError(creditNoteId);
  }

  if (creditNote.status !== 'issued') {
    throw new CreditNoteStatusTransitionError(creditNoteId, creditNote.status, 'applied');
  }

  // Validate invoice exists
  const invoice = await invoicesRepository.findById(data.invoiceId, tenantId);
  if (!invoice) {
    throw new InvoiceNotFoundError(data.invoiceId);
  }

  // Check amount does not exceed available balance
  if (Number(data.amountApplied) > Number(creditNote.balance)) {
    throw new CreditNoteAmountExceedsBalanceError(
      creditNoteId,
      data.amountApplied,
      creditNote.balance,
    );
  }

  // Create payment application as a credit application
  await paymentApplicationsRepository.create(
    {
      paymentId: creditNoteId, // Reference credit note via payment ID field
      invoiceId: data.invoiceId,
      amountApplied: data.amountApplied,
      appliedDate: data.appliedDate,
    },
    tenantId,
  );

  // Update credit note amounts
  const newAmountApplied = decimalAdd(creditNote.amountApplied, data.amountApplied);
  const newBalance = decimalSubtract(creditNote.amount, newAmountApplied);
  const newStatus = Number(newBalance) <= 0 ? 'applied' : creditNote.status;

  await creditNotesRepository.update(creditNoteId, tenantId, {
    amountApplied: newAmountApplied,
    balance: newBalance,
    status: newStatus,
  });

  // Update invoice paid amount
  await updateInvoicePaidAmount(data.invoiceId, tenantId);
}
