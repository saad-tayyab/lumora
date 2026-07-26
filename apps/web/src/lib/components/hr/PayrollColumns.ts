import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'employeeName', label: 'Employee' },
  {
    key: 'payPeriodStart',
    label: 'Period Start',
    format: (row) => formatDate(row.payPeriodStart as string),
  },
  {
    key: 'payPeriodEnd',
    label: 'Period End',
    format: (row) => formatDate(row.payPeriodEnd as string),
  },
  {
    key: 'netPay',
    label: 'Net Pay',
    class: 'text-right',
    format: (row) => `$${parseFloat((row.netPay as string) || '0').toFixed(2)}`,
  },
  { key: 'status', label: 'Status' },
];
