import { Topic } from 'encore.dev/pubsub';

export interface SalesOrderCreatedEvent {
  salesOrderId: string;
  customerId: string;
  tenantId: string;
}

export const salesOrderCreated = new Topic<SalesOrderCreatedEvent>('sales-order-created', {
  deliveryGuarantee: 'at-least-once',
});

export interface SalesOrderStatusChangedEvent {
  salesOrderId: string;
  oldStatus: string;
  newStatus: string;
  tenantId: string;
}

export const salesOrderStatusChanged = new Topic<SalesOrderStatusChangedEvent>(
  'sales-order-status-changed',
  { deliveryGuarantee: 'at-least-once' },
);

export interface QuotationCreatedEvent {
  quotationId: string;
  customerId: string;
  tenantId: string;
}

export const quotationCreated = new Topic<QuotationCreatedEvent>('quotation-created', {
  deliveryGuarantee: 'at-least-once',
});

export interface QuotationAcceptedEvent {
  quotationId: string;
  tenantId: string;
}

export const quotationAccepted = new Topic<QuotationAcceptedEvent>('quotation-accepted', {
  deliveryGuarantee: 'at-least-once',
});
