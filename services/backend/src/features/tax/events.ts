import { Topic } from 'encore.dev/pubsub';

export interface TaxRateCreatedEvent {
  taxCodeId: string;
  rate: number;
  effectiveDate: string;
  tenantId: string;
}

export const taxRateCreated = new Topic<TaxRateCreatedEvent>('tax-rate-created', {
  deliveryGuarantee: 'at-least-once',
});

export interface TaxRateUpdatedEvent {
  taxCodeId: string;
  oldRate: number;
  newRate: number;
  tenantId: string;
}

export const taxRateUpdated = new Topic<TaxRateUpdatedEvent>('tax-rate-updated', {
  deliveryGuarantee: 'at-least-once',
});
