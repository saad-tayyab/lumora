import { Topic } from 'encore.dev/pubsub';

export interface JournalEntryPostedEvent {
  entryId: string;
  periodId: string;
  tenantId: string;
}

export const journalEntryPosted = new Topic<JournalEntryPostedEvent>('journal-entry-posted', {
  deliveryGuarantee: 'at-least-once',
});
