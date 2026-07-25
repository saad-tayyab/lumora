import { Topic } from 'encore.dev/pubsub';

export interface BillReceivedEvent {
  billId: string;
  vendorId: string;
  tenantId: string;
}

export const billReceived = new Topic<BillReceivedEvent>('bill-received', {
  deliveryGuarantee: 'at-least-once',
});
