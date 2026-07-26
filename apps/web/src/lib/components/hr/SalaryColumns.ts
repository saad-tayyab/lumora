import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'employeeName', label: 'Employee' },
  {
    key: 'basicSalary',
    label: 'Basic',
    class: 'text-right',
    format: (row) => formatCurrency(row.basicSalary as string),
  },
  {
    key: 'allowances',
    label: 'Allowances',
    class: 'text-right',
    format: (row) => formatCurrency(row.allowances as string),
  },
  {
    key: 'deductions',
    label: 'Deductions',
    class: 'text-right',
    format: (row) => formatCurrency(row.deductions as string),
  },
  {
    key: 'netSalary',
    label: 'Net',
    class: 'text-right',
    format: (row) => formatCurrency(row.netSalary as string),
  },
  {
    key: 'effectiveDate',
    label: 'Effective',
    format: (row) => formatDate(row.effectiveDate as string),
  },
];
