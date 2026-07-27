<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let payslips = $state(data.payslips);
let total = $state(data.total);

const columns: ColumnDef<any>[] = [
  { accessorKey: 'employeeName', header: 'Employee', cell: (row) => `<span class="text-sm font-medium">${(row as any).original.employeeName}</span>` },
  { accessorKey: 'period', header: 'Period', cell: (row) => `<span class="text-sm">${(row as any).original.period}</span>` },
  { accessorKey: 'payrollNumber', header: 'Payroll #', cell: (row) => `<span class="text-sm">${(row as any).original.payrollNumber}</span>` },
  { accessorKey: 'basicSalary', header: 'Basic', cell: (row) => `<span class="text-sm text-right">${formatCurrency((row as any).original.basicSalary)}</span>` },
  { accessorKey: 'allowances', header: 'Allowances', cell: (row) => `<span class="text-sm text-right">${formatCurrency((row as any).original.allowances)}</span>` },
  { accessorKey: 'deductions', header: 'Deductions', cell: (row) => `<span class="text-sm text-right">${formatCurrency((row as any).original.deductions)}</span>` },
  { accessorKey: 'netPay', header: 'Net Pay', cell: (row) => `<span class="text-sm text-right font-medium">${formatCurrency((row as any).original.netPay)}</span>` },
  { accessorKey: 'generatedAt', header: 'Generated', cell: (row) => `<span class="text-sm">${formatDate((row as any).original.generatedAt)}</span>` },
];
</script>

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Payslips</h1><p class="text-muted-foreground">View employee payslips</p></div>
  <AppDataTable
    {columns}
    data={payslips}
    emptyMessage="No payslips"
    pageSize={20}
    totalItems={total}
  />
</div>
