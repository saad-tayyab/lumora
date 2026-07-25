import { AppError } from '../../lib/errors';

// ─── Customer Errors ──────────────────────────────────────────────────────────

export class CustomerNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Customer with id ${id} not found`, 404);
  }
}

export class CustomerDuplicateEmailError extends AppError {
  constructor(email: string) {
    super('CONFLICT', `Customer with email ${email} already exists`, 409);
  }
}

export class CustomerHasOutstandingInvoicesError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Cannot deactivate customer ${id} — outstanding invoices exist`, 409);
  }
}

// ─── Invoice Errors ───────────────────────────────────────────────────────────

export class InvoiceNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Invoice with id ${id} not found`, 404);
  }
}

export class InvoiceDuplicateNumberError extends AppError {
  constructor(invoiceNumber: string) {
    super('CONFLICT', `Invoice with number ${invoiceNumber} already exists`, 409);
  }
}

export class InvoiceAlreadyVoidedError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Invoice ${id} is already voided`, 409);
  }
}

export class InvoiceAlreadyPaidError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Invoice ${id} is already fully paid`, 409);
  }
}

export class InvoiceStatusTransitionError extends AppError {
  constructor(id: string, from: string, to: string) {
    super('CONFLICT', `Invoice ${id} cannot transition from ${from} to ${to}`, 409);
  }
}

export class InvoiceLineItemRequiredError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Invoice must have at least one line item', 400);
  }
}

export class InvoiceCreditLimitExceededError extends AppError {
  constructor(customerId: string, limit: string, pending: string) {
    super(
      'CONFLICT',
      `Customer ${customerId} credit limit of ${limit} would be exceeded. Pending balance: ${pending}`,
      409,
    );
  }
}

// ─── Payment Errors ───────────────────────────────────────────────────────────

export class PaymentNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Payment with id ${id} not found`, 404);
  }
}

export class PaymentDuplicateNumberError extends AppError {
  constructor(paymentNumber: string) {
    super('CONFLICT', `Payment with number ${paymentNumber} already exists`, 409);
  }
}

export class PaymentAmountExceedsInvoiceBalanceError extends AppError {
  constructor(paymentId: string, amount: string, balanceDue: string) {
    super(
      'VALIDATION_ERROR',
      `Payment ${paymentId} amount ${amount} exceeds invoice balance due of ${balanceDue}`,
      400,
    );
  }
}

// ─── Credit Note Errors ───────────────────────────────────────────────────────

export class CreditNoteNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Credit note with id ${id} not found`, 404);
  }
}

export class CreditNoteDuplicateNumberError extends AppError {
  constructor(creditNoteNumber: string) {
    super('CONFLICT', `Credit note with number ${creditNoteNumber} already exists`, 409);
  }
}

export class CreditNoteAlreadyAppliedError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Credit note ${id} is already fully applied`, 409);
  }
}

export class CreditNoteStatusTransitionError extends AppError {
  constructor(id: string, from: string, to: string) {
    super('CONFLICT', `Credit note ${id} cannot transition from ${from} to ${to}`, 409);
  }
}

export class CreditNoteAmountExceedsBalanceError extends AppError {
  constructor(id: string, amount: string, available: string) {
    super(
      'VALIDATION_ERROR',
      `Credit note ${id} apply amount ${amount} exceeds available balance of ${available}`,
      400,
    );
  }
}

// ─── Payment Application Errors ───────────────────────────────────────────────

export class PaymentApplicationNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Payment application with id ${id} not found`, 404);
  }
}

export class PaymentAlreadyFullyAppliedError extends AppError {
  constructor(paymentId: string) {
    super('CONFLICT', `Payment ${paymentId} is already fully applied`, 409);
  }
}
