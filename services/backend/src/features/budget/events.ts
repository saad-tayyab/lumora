import { Topic } from 'encore.dev/pubsub';

export interface BudgetCreatedEvent {
  budgetHeaderId: string;
  tenantId: string;
}

export const budgetCreated = new Topic<BudgetCreatedEvent>('budget-created', {
  deliveryGuarantee: 'at-least-once',
});

export interface BudgetConsumedEvent {
  budgetLineId: string;
  amount: number;
  tenantId: string;
}

export const budgetConsumed = new Topic<BudgetConsumedEvent>('budget-consumed', {
  deliveryGuarantee: 'at-least-once',
});

export interface BudgetExceededEvent {
  budgetLineId: string;
  threshold: number;
  actual: number;
  tenantId: string;
}

export const budgetExceeded = new Topic<BudgetExceededEvent>('budget-exceeded', {
  deliveryGuarantee: 'at-least-once',
});
