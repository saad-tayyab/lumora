import {
  ActiveBudgetExistsForPeriodError,
  BudgetConsumptionNotFoundError,
  BudgetHeaderNotDraftError,
  BudgetHeaderNotFoundError,
  BudgetLineNotFoundError,
  DuplicateGlAccountInBudgetError,
  NegativeConsumptionAmountError,
} from './errors';
import { budgetConsumptionsRepo, budgetHeadersRepo, budgetLinesRepo } from './repo';
import type {
  BudgetConsumptionResponse,
  BudgetHeaderResponse,
  BudgetHeaderWithLines,
  BudgetLineResponse,
  BudgetVarianceResponse,
  CreateBudgetConsumptionRequest,
  CreateBudgetHeaderRequest,
  CreateBudgetLineRequest,
  ListResponse,
  PaginationParams,
  UpdateBudgetHeaderRequest,
  UpdateBudgetLineRequest,
} from './types';

// ─── Budget Header Service ──────────────────────────────────────────────

export async function createBudgetHeader(
  data: CreateBudgetHeaderRequest,
  tenantId: string,
): Promise<BudgetHeaderResponse> {
  // INV-BUDGET-002: Only one budget can be active per period per tenant
  const existingActive = await budgetHeadersRepo.findActiveByPeriod(
    data.periodStart,
    data.periodEnd,
    tenantId,
  );

  if (existingActive) {
    throw new ActiveBudgetExistsForPeriodError(data.periodStart, data.periodEnd);
  }

  return budgetHeadersRepo.create({
    name: data.name,
    description: data.description,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    totalAmount: data.totalAmount,
    status: 'draft',
    isActive: true,
    tenantId,
  });
}

export async function getBudgetHeader(
  id: string,
  tenantId: string,
): Promise<BudgetHeaderWithLines> {
  const header = await budgetHeadersRepo.findById(id, tenantId);
  if (!header) {
    throw new BudgetHeaderNotFoundError(id);
  }

  const lines = await budgetLinesRepo.findByBudgetHeaderId(id, tenantId);

  return { ...header, lines };
}

export async function listBudgetHeaders(
  tenantId: string,
  params: PaginationParams & {
    status?: string;
    isActive?: boolean;
  },
): Promise<ListResponse<BudgetHeaderResponse>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await budgetHeadersRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
    status: params.status,
    isActive: params.isActive,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function updateBudgetHeader(
  id: string,
  data: UpdateBudgetHeaderRequest,
  tenantId: string,
): Promise<BudgetHeaderResponse> {
  const existing = await budgetHeadersRepo.findById(id, tenantId);
  if (!existing) {
    throw new BudgetHeaderNotFoundError(id);
  }

  // Can only update draft headers (except status and isActive)
  if (existing.status !== 'draft' && (data.name || data.periodStart || data.periodEnd)) {
    throw new BudgetHeaderNotDraftError(id, existing.status);
  }

  // INV-BUDGET-002: When activating, verify no overlap
  if (data.status === 'active') {
    const overlapping = await budgetHeadersRepo.findActiveByPeriod(
      existing.periodStart,
      existing.periodEnd,
      tenantId,
      id,
    );

    if (overlapping) {
      throw new ActiveBudgetExistsForPeriodError(existing.periodStart, existing.periodEnd);
    }
  }

  return budgetHeadersRepo.update(id, tenantId, data);
}

export async function deleteBudgetHeader(id: string, tenantId: string): Promise<void> {
  const existing = await budgetHeadersRepo.findById(id, tenantId);
  if (!existing) {
    throw new BudgetHeaderNotFoundError(id);
  }

  // Only draft budgets can be deleted
  if (existing.status !== 'draft') {
    throw new BudgetHeaderNotDraftError(id, existing.status);
  }

  // INV-BUDGET-003: Soft-delete all lines first (cascade is set on DB)
  await budgetLinesRepo.deleteByBudgetHeaderId(id, tenantId);
  await budgetHeadersRepo.delete(id, tenantId);
}

// ─── Budget Line Service ────────────────────────────────────────────────

export async function createBudgetLine(
  headerId: string,
  data: CreateBudgetLineRequest,
  tenantId: string,
): Promise<BudgetLineResponse> {
  const header = await budgetHeadersRepo.findById(headerId, tenantId);
  if (!header) {
    throw new BudgetHeaderNotFoundError(headerId);
  }

  // Can only add lines to draft budgets
  if (header.status !== 'draft') {
    throw new BudgetHeaderNotDraftError(headerId, header.status);
  }

  // Check for duplicate GL account in same budget
  const duplicate = await budgetLinesRepo.findByBudgetHeaderAndGlAccount(
    headerId,
    data.glAccountId,
    tenantId,
  );
  if (duplicate) {
    throw new DuplicateGlAccountInBudgetError(data.glAccountId);
  }

  const line = await budgetLinesRepo.create({
    budgetHeaderId: headerId,
    glAccountId: data.glAccountId,
    description: data.description,
    budgetAmount: data.budgetAmount,
    consumedAmount: '0',
    varianceAmount: '0',
    isActive: true,
    tenantId,
  });

  // Recalculate header total
  await recalculateHeaderTotal(headerId, tenantId);

  return line;
}

export async function updateBudgetLine(
  headerId: string,
  lineId: string,
  data: UpdateBudgetLineRequest,
  tenantId: string,
): Promise<BudgetLineResponse> {
  const header = await budgetHeadersRepo.findById(headerId, tenantId);
  if (!header) {
    throw new BudgetHeaderNotFoundError(headerId);
  }

  // Can only update lines in draft budgets
  if (header.status !== 'draft') {
    throw new BudgetHeaderNotDraftError(headerId, header.status);
  }

  const line = await budgetLinesRepo.findById(lineId, tenantId);
  if (!line) {
    throw new BudgetLineNotFoundError(lineId);
  }

  if (line.budgetHeaderId !== headerId) {
    throw new BudgetLineNotFoundError(lineId);
  }

  const updatedLine = await budgetLinesRepo.update(lineId, tenantId, data);

  // Recalculate header total if amount changed
  if (data.budgetAmount !== undefined) {
    await recalculateHeaderTotal(headerId, tenantId);
  }

  return updatedLine;
}

export async function deleteBudgetLine(
  headerId: string,
  lineId: string,
  tenantId: string,
): Promise<void> {
  const header = await budgetHeadersRepo.findById(headerId, tenantId);
  if (!header) {
    throw new BudgetHeaderNotFoundError(headerId);
  }

  // Can only delete lines from draft budgets
  if (header.status !== 'draft') {
    throw new BudgetHeaderNotDraftError(headerId, header.status);
  }

  const line = await budgetLinesRepo.findById(lineId, tenantId);
  if (!line) {
    throw new BudgetLineNotFoundError(lineId);
  }

  if (line.budgetHeaderId !== headerId) {
    throw new BudgetLineNotFoundError(lineId);
  }

  await budgetLinesRepo.delete(lineId, tenantId);

  // Recalculate header total
  await recalculateHeaderTotal(headerId, tenantId);
}

// ─── Budget Consumption Service ─────────────────────────────────────────

export async function createBudgetConsumption(
  data: CreateBudgetConsumptionRequest,
  tenantId: string,
): Promise<BudgetConsumptionResponse> {
  // INV-BUDGET-001: Budget consumption amounts must be non-negative
  if (Number(data.amount) < 0) {
    throw new NegativeConsumptionAmountError(data.amount);
  }

  const line = await budgetLinesRepo.findById(data.budgetLineId, tenantId);
  if (!line) {
    throw new BudgetLineNotFoundError(data.budgetLineId);
  }

  // Check budget header exists and is active
  const header = await budgetHeadersRepo.findById(line.budgetHeaderId, tenantId);
  if (!header) {
    throw new BudgetHeaderNotFoundError(line.budgetHeaderId);
  }

  if (!header.isActive) {
    throw new BudgetHeaderNotDraftError(header.id, header.status);
  }

  // BR-018: Budget consumption is tracked per GL account per period
  const consumption = await budgetConsumptionsRepo.create({
    budgetLineId: data.budgetLineId,
    journalEntryId: data.journalEntryId,
    amount: data.amount,
    description: data.description,
    consumptionDate: data.consumptionDate,
    tenantId,
  });

  // Update consumed amount and variance on the budget line
  await updateLineConsumption(data.budgetLineId, tenantId);

  return consumption;
}

export async function getBudgetConsumption(
  id: string,
  tenantId: string,
): Promise<BudgetConsumptionResponse> {
  const consumption = await budgetConsumptionsRepo.findById(id, tenantId);
  if (!consumption) {
    throw new BudgetConsumptionNotFoundError(id);
  }
  return consumption;
}

export async function listBudgetConsumptions(
  tenantId: string,
  params: PaginationParams & {
    budgetLineId?: string;
  },
): Promise<ListResponse<BudgetConsumptionResponse>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await budgetConsumptionsRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
    budgetLineId: params.budgetLineId,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function reverseConsumptionsForJournalEntry(
  journalEntryId: string,
  tenantId: string,
): Promise<void> {
  // BR-020: Budget consumption reverses when journal entries are voided
  const consumptions = await budgetConsumptionsRepo.findByJournalEntryId(journalEntryId, tenantId);

  for (const consumption of consumptions) {
    // Reverse by subtracting the consumption amount from the line
    const line = await budgetLinesRepo.findById(consumption.budgetLineId, tenantId);
    if (line) {
      const newConsumed = Math.max(0, Number(line.consumedAmount) - Number(consumption.amount));
      const newVariance = Number(line.budgetAmount) - newConsumed;

      await budgetLinesRepo.update(line.id, tenantId, {
        consumedAmount: String(newConsumed.toFixed(4)),
        varianceAmount: String(newVariance.toFixed(4)),
      });
    }

    // Delete the consumption record
    await budgetConsumptionsRepo.delete(consumption.id, tenantId);
  }
}

// ─── Variance Calculation ───────────────────────────────────────────────

export async function getBudgetVariance(
  headerId: string,
  tenantId: string,
): Promise<BudgetVarianceResponse[]> {
  const lines = await budgetLinesRepo.findByBudgetHeaderId(headerId, tenantId);

  return lines.map((line) => ({
    budgetLineId: line.id,
    glAccountId: line.glAccountId,
    budgetAmount: line.budgetAmount,
    consumedAmount: line.consumedAmount,
    // BR-019: Budget variance is calculated as consumed minus budgeted amount
    varianceAmount: String((Number(line.consumedAmount) - Number(line.budgetAmount)).toFixed(4)),
  }));
}

// ─── Helper Functions ───────────────────────────────────────────────────

async function recalculateHeaderTotal(headerId: string, tenantId: string): Promise<void> {
  const total = await budgetLinesRepo.getTotalBudgetAmount(headerId, tenantId);
  await budgetHeadersRepo.update(headerId, tenantId, {
    totalAmount: total,
  });
}

async function updateLineConsumption(budgetLineId: string, tenantId: string): Promise<void> {
  const line = await budgetLinesRepo.findById(budgetLineId, tenantId);
  if (!line) return;

  const totalConsumed = await budgetConsumptionsRepo.getTotalConsumedByLineId(
    budgetLineId,
    tenantId,
  );

  // BR-019: Variance = consumed - budgeted (negative means over budget)
  const consumed = Number(totalConsumed);
  const budgeted = Number(line.budgetAmount);
  const variance = consumed - budgeted;

  await budgetLinesRepo.update(budgetLineId, tenantId, {
    consumedAmount: totalConsumed,
    varianceAmount: String(variance.toFixed(4)),
  });
}
