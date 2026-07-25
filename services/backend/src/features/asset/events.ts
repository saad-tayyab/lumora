import { Topic } from 'encore.dev/pubsub';

export interface DepreciationPostedEvent {
  assetId: string;
  periodId: string;
  amount: number;
  tenantId: string;
}

export const depreciationPosted = new Topic<DepreciationPostedEvent>('depreciation-posted', {
  deliveryGuarantee: 'at-least-once',
});
