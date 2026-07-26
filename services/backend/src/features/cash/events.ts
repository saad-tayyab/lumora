import { Topic } from 'encore.dev/pubsub';

export interface TransferCreatedEvent {
  transferId: string;
  fromBankAccountId: string;
  toBankAccountId: string;
  amount: number;
  tenantId: string;
}

export const transferCreated = new Topic<TransferCreatedEvent>('transfer-created', {
  deliveryGuarantee: 'at-least-once',
});

export interface BankReconciledEvent {
  bankAccountId: string;
  reconciledDate: string;
  tenantId: string;
}

export const bankReconciled = new Topic<BankReconciledEvent>('bank-reconciled', {
  deliveryGuarantee: 'at-least-once',
});
