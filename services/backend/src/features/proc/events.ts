import { Topic } from 'encore.dev/pubsub';

export interface PurchaseOrderCreatedEvent {
  purchaseOrderId: string;
  vendorId: string;
  tenantId: string;
}

export const purchaseOrderCreated = new Topic<PurchaseOrderCreatedEvent>('purchase-order-created', {
  deliveryGuarantee: 'at-least-once',
});

export interface PurchaseOrderStatusChangedEvent {
  purchaseOrderId: string;
  oldStatus: string;
  newStatus: string;
  tenantId: string;
}

export const purchaseOrderStatusChanged = new Topic<PurchaseOrderStatusChangedEvent>(
  'purchase-order-status-changed',
  { deliveryGuarantee: 'at-least-once' },
);

export interface GoodsReceivedEvent {
  purchaseOrderId: string;
  receivedDate: string;
  tenantId: string;
}

export const goodsReceived = new Topic<GoodsReceivedEvent>('goods-received', {
  deliveryGuarantee: 'at-least-once',
});
