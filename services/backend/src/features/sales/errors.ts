import { AppError } from '../../lib/errors';

// ─── Sales Order Errors ──────────────────────────────────────────────────────

export class SalesOrderNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Sales order with id ${id} not found`, 404);
  }
}

export class SalesOrderDuplicateNumberError extends AppError {
  constructor(orderNumber: string) {
    super('CONFLICT', `Sales order with number ${orderNumber} already exists`, 409);
  }
}

export class SalesOrderStatusTransitionError extends AppError {
  constructor(id: string, from: string, to: string) {
    super('CONFLICT', `Sales order ${id} cannot transition from ${from} to ${to}`, 409);
  }
}

export class SalesOrderAlreadyCancelledError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Sales order ${id} is already cancelled`, 409);
  }
}

export class SalesOrderAlreadyClosedError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Sales order ${id} is already closed`, 409);
  }
}

export class SalesOrderLineItemRequiredError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Sales order must have at least one line item', 400);
  }
}

export class SalesOrderCannotEditNonDraftError extends AppError {
  constructor(id: string, status: string) {
    super(
      'CONFLICT',
      `Sales order ${id} in status '${status}' can only be edited when in draft status`,
      409,
    );
  }
}

// ─── Sales Order Line Item Errors ─────────────────────────────────────────────

export class SalesOrderLineItemNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Sales order line item with id ${id} not found`, 404);
  }
}

// ─── Quotation Errors ─────────────────────────────────────────────────────────

export class QuotationNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Quotation with id ${id} not found`, 404);
  }
}

export class QuotationDuplicateNumberError extends AppError {
  constructor(quotationNumber: string) {
    super('CONFLICT', `Quotation with number ${quotationNumber} already exists`, 409);
  }
}

export class QuotationStatusTransitionError extends AppError {
  constructor(id: string, from: string, to: string) {
    super('CONFLICT', `Quotation ${id} cannot transition from ${from} to ${to}`, 409);
  }
}

export class QuotationAlreadyExpiredError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Quotation ${id} has already expired`, 409);
  }
}

export class QuotationLineItemRequiredError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Quotation must have at least one line item', 400);
  }
}

export class QuotationCannotEditNonDraftError extends AppError {
  constructor(id: string, status: string) {
    super(
      'CONFLICT',
      `Quotation ${id} in status '${status}' can only be edited when in draft status`,
      409,
    );
  }
}

// ─── Quotation Line Item Errors ───────────────────────────────────────────────

export class QuotationLineItemNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Quotation line item with id ${id} not found`, 404);
  }
}

// ─── Discount Policy Errors ───────────────────────────────────────────────────

export class DiscountPolicyNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Discount policy with id ${id} not found`, 404);
  }
}

export class DiscountPolicyNameConflictError extends AppError {
  constructor(name: string) {
    super('CONFLICT', `Discount policy with name '${name}' already exists`, 409);
  }
}

export class DiscountPolicyExpiredError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Discount policy ${id} is no longer valid (expired)`, 409);
  }
}

// ─── Customer Errors ──────────────────────────────────────────────────────────

export class CustomerNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Customer with id ${id} not found`, 404);
  }
}
