<script lang="ts">
import { toast } from 'svelte-sonner';
import { hrApi, type Payroll } from '$lib/api/hr';
import { formatCurrency } from '$lib/utils/format';
import type { PageData } from './$types';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let payroll = $state<Payroll[]>(data.payroll);
let total = $state(data.total);
let statusFilter = $state('');
let isLoading = $state(false);

function prStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    processed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function processPayroll(id: string) {
  if (!confirm('Process this payroll?')) return;
  try {
    const updated = await hrApi.payroll.process(id);
    payroll = payroll.map((p) => (p.id === id ? updated : p));
    toast.success('Payroll processed');
  } catch {
    toast.error('Failed to process');
  }
}

async function deletePayroll(id: string) {
  if (!confirm('Delete this payroll?')) return;
  try {
    await hrApi.payroll.delete(id);
    payroll = payroll.filter((p) => p.id !== id);
    total--;
    toast.success('Payroll deleted');
  } catch {
    toast.error('Failed to delete');
  }
}

const columns: ColumnDef<Payroll>[] = [
  { accessorKey: 'payrollNumber', header: 'Payroll #', cell: (row) => `<span class="font-medium text-primary">${(row as any).original.payrollNumber}</span>` },
  { accessorKey: 'period', header: 'Period', cell: (row) => `<span class="text-sm">${(row as any).original.period}</span>` },
  { accessorKey: 'totalGross', header: 'Gross', cell: (row) => `<span class="text-sm text-right">${formatCurrency((row as any).original.totalGross)}</span>` },
  { accessorKey: 'totalDeductions', header: 'Deductions', cell: (row) => `<span class="text-sm text-right">${formatCurrency((row as any).original.totalDeductions)}</span>` },
  { accessorKey: 'totalNet', header: 'Net', cell: (row) => `<span class="text-sm text-right font-medium">${formatCurrency((row as any).original.totalNet)}</span>` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium ${prStatusColor((row as any).original.status)}">${formatStatus((row as any).original.status)}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => {
      if ((row as any).original.status !== 'draft') return '';
      return `<div class="flex items-center justify-end gap-2"><button onclick="window.dispatchEvent(new CustomEvent('process-payroll', {detail:'${(row as any).original.id}'}))" class="text-sm text-green-600 hover:underline">Process</button><button onclick="window.dispatchEvent(new CustomEvent('delete-payroll', {detail:'${(row as any).original.id}'}))" class="text-sm text-destructive hover:underline">Delete</button></div>`;
    },
  },
];

$effect(() => {
  const handler = (e: Event) => processPayroll((e as CustomEvent).detail);
  window.addEventListener('process-payroll', handler);
  return () => window.removeEventListener('process-payroll', handler);
});
$effect(() => {
  const handler = (e: Event) => deletePayroll((e as CustomEvent).detail);
  window.addEventListener('delete-payroll', handler);
  return () => window.removeEventListener('delete-payroll', handler);
});
</script>

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Payroll</h1><p class="text-muted-foreground">Manage payroll runs</p></div>
  <div class="flex items-center gap-4">
    <select bind:value={statusFilter} class="rounded-md border bg-background px-3 py-2 text-sm"><option value="">All Statuses</option><option value="draft">Draft</option><option value="processed">Processed</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>
  <AppDataTable
    {columns}
    data={payroll}
    loading={isLoading}
    emptyMessage="No payroll records"
    pageSize={20}
    totalItems={total}
  />
</div>
