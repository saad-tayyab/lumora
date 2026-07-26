import { Topic } from 'encore.dev/pubsub';

export interface AuditLogCreatedEvent {
  entityType: string;
  entityId: string;
  action: string;
  tenantId: string;
}

export const auditLogCreated = new Topic<AuditLogCreatedEvent>('audit-log-created', {
  deliveryGuarantee: 'at-least-once',
});
