import { AppError } from '../../lib/errors';

// ─── Budget Header Errors ─────────────────────────────────────────────────

export class BudgetHeaderNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Budget header with id "${id}" not found`, 404);
  }
}

export class BudgetHeaderNotDraftError extends AppError {
  constructor(id: string, status: string) {
    super(
      'CONFLICT',
      `Budget header "${id}" is not in draft status (current status: ${status})`,
      409,
    );
  }
}

export class ActiveBudgetExistsForPeriodError extends AppError {
  constructor(periodStart: string, periodEnd: string) {
    super(
      'CONFLICT',
      `An active budget already exists for the period ${periodStart} to ${periodEnd}`,
      409,
    );
  }
}

// ─── Budget Line Errors ───────────────────────────────────────────────────

export class BudgetLineNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Budget line with id "${id}" not found`, 404);
  }
}

export class BudgetLineAmountMismatchError extends AppError {
  constructor(headerTotal: string, linesTotal: string) {
    super(
      'VALIDATION_ERROR',
      `Budget line amounts (${linesTotal}) do not sum to the header total amount (${headerTotal})`,
      400,
    );
  }
}

export class DuplicateGlAccountInBudgetError extends AppError {
  constructor(glAccountId: string) {
    super(
      'CONFLICT',
      `GL account "${glAccountId}" already has a budget line in this budget header`,
      409,
    );
  }
}

// ─── Budget Consumption Errors ────────────────────────────────────────────

export class BudgetConsumptionNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Budget consumption with id "${id}" not found`, 404);
  }
}

export class NegativeConsumptionAmountError extends AppError {
  constructor(amount: string) {
    super(
      'VALIDATION_ERROR',
      `Budget consumption amount must be non-negative (received: ${amount})`,
      400,
    );
  }
}

export class BudgetExceededError extends AppError {
  constructor(budgetLineId: string, budgetAmount: string, consumedAmount: string) {
    super(
      'UNPROCESSABLE',
      `Budget line "${budgetLineId}" exceeded: budgeted ${budgetAmount}, consumed ${consumedAmount}`,
      422,
    );
  }
}

// ─── Period Errors ────────────────────────────────────────────────────────

export class BudgetPeriodOverlapError extends AppError {
  constructor(name: string) {
    super('CONFLICT', `Budget "${name}" period overlaps with an existing active budget`, 409);
  }
}
