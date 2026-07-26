import { Topic } from 'encore.dev/pubsub';

export interface EmployeeHiredEvent {
  employeeId: string;
  userId: string | null;
  tenantId: string;
}

export const employeeHired = new Topic<EmployeeHiredEvent>('employee-hired', {
  deliveryGuarantee: 'at-least-once',
});

export interface LeaveRequestedEvent {
  leaveRequestId: string;
  employeeId: string;
  tenantId: string;
}

export const leaveRequested = new Topic<LeaveRequestedEvent>('leave-requested', {
  deliveryGuarantee: 'at-least-once',
});

export interface PayrollProcessedEvent {
  payrollId: string;
  periodId: string;
  tenantId: string;
}

export const payrollProcessed = new Topic<PayrollProcessedEvent>('payroll-processed', {
  deliveryGuarantee: 'at-least-once',
});
