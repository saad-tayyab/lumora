import { Topic } from 'encore.dev/pubsub';

export interface StockAdjustedEvent {
  itemId: string;
  warehouseId: string;
  quantity: number;
  tenantId: string;
}

export const stockAdjusted = new Topic<StockAdjustedEvent>('stock-adjusted', {
  deliveryGuarantee: 'at-least-once',
});
