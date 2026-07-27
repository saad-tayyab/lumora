<script lang="ts">
import { toast } from 'svelte-sonner';
import { hrApi, type Salary } from '$lib/api/hr';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import { Badge } from '$lib/components/ui/badge';

let { data }: { data: PageData } = $props();
let salaries = $state<Salary[]>(data.salaries);
let total = $state(data.total);

async function deleteSalary(id: string) {
  if (!confirm('Delete this salary record?')) return;
  try {
    await hrApi.salaries.delete(id);
    salaries = salaries.filter((s) => s.id !== id);
    total--;
    toast.success('Salary deleted');
  } catch {
    toast.error('Failed to delete');
  }
}

const columns: ColumnDef<Salary>[] = [
  { accessorKey: 'employeeName', header: 'Employee', cell: (row) => `<span class="text-sm font-medium">${(row as any).original.employeeName}</span>` },
  { accessorKey: 'basicSalary', header: 'Basic Salary', cell: (row) => `<span class="text-sm text-right">${formatCurrency((row as any).original.basicSalary)}</span>` },
  { accessorKey: 'allowances', header: 'Allowances', cell: (row) => `<span class="text-sm text-right">${formatCurrency((row as any).original.allowances)}</span>` },
  { accessorKey: 'deductions', header: 'Deductions', cell: (row) => `<span class="text-sm text-right">${formatCurrency((row as any).original.deductions)}</span>` },
  { accessorKey: 'effectiveFrom', header: 'Effective From', cell: (row) => `<span class="text-sm">${formatDate((row as any).original.effectiveFrom)}</span>` },
  {
    accessorKey: 'isActive',
    header: 'Active',
    cell: (row) => (row as any).original.isActive
      ? '<Badge variant="secondary">Active</Badge>'
      : '<Badge variant="outline">Inactive</Badge>',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<button onclick="window.dispatchEvent(new CustomEvent('delete-salary', {detail:'${(row as any).original.id}'}))" class="text-sm text-destructive hover:underline">Delete</button>`,
  },
];

$effect(() => {
  const handler = (e: Event) => deleteSalary((e as CustomEvent).detail);
  window.addEventListener('delete-salary', handler);
  return () => window.removeEventListener('delete-salary', handler);
});
</script>

<div class="flex flex-col gap-6">
  <div><h1 class="text-3xl font-bold text-foreground">Salaries</h1><p class="text-muted-foreground">Manage employee salary records</p></div>
  <AppDataTable
    {columns}
    data={salaries}
    emptyMessage="No salary records"
    pageSize={20}
    totalItems={total}
  />
</div>
