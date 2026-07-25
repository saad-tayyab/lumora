import { Topic } from 'encore.dev/pubsub';

export interface InvoiceCreatedEvent {
  invoiceId: string;
  customerId: string;
  tenantId: string;
}

export const invoiceCreated = new Topic<InvoiceCreatedEvent>('invoice-created', {
  deliveryGuarantee: 'at-least-once',
});
