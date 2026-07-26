import { Topic } from 'encore.dev/pubsub';

export interface UserCreatedEvent {
  userId: string;
  tenantId: string;
}

export const userCreated = new Topic<UserCreatedEvent>('user-created', {
  deliveryGuarantee: 'at-least-once',
});

export interface RoleAssignedEvent {
  userId: string;
  roleId: string;
  tenantId: string;
}

export const roleAssigned = new Topic<RoleAssignedEvent>('role-assigned', {
  deliveryGuarantee: 'at-least-once',
});
