<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll, goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

async function handleDelete(id: string) {
  if (!confirm('Delete this budget?')) return;
  deleting = id;
  try {
    const { deleteBudget } = await import('$lib/api/budget');
    await deleteBudget(id);
    toast.success('Budget deleted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete');
  } finally {
    deleting = null;
  }
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'name', header: 'Name', cell: (row) => `<a href="/budgets/${(row as any).original.id}" class="font-medium hover:underline">${(row as any).original.name}</a>` },
  { accessorKey: 'periodStart', header: 'Period', cell: (row) => `${formatDate((row as any).original.periodStart)} - ${formatDate((row as any).original.periodEnd)}` },
  { accessorKey: 'totalAmount', header: 'Total Amount', cell: (row) => `<span class="text-right">${formatCurrency((row as any).original.totalAmount)}</span>` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor((row as any).original.status)}">${(row as any).original.status}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<div class="flex items-center justify-end gap-2"><a href="/budgets/${(row as any).original.id}/edit" class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">Edit</a><button onclick="window.dispatchEvent(new CustomEvent('delete-budget', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button></div>`,
  },
];

$effect(() => {
  const handler = (e: Event) => handleDelete((e as CustomEvent).detail);
  window.addEventListener('delete-budget', handler);
  return () => window.removeEventListener('delete-budget', handler);
});
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Budgets</h1>
      <p class="text-muted-foreground">{data.total} budgets</p>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline" href="/budgets/consumptions">Consumptions</Button>
      <Button href="/budgets/new">New Budget</Button>
    </div>
  </div>

  <AppDataTable
    {columns}
    data={data.budgets}
    emptyMessage="No budgets found"
    pageSize={20}
    totalItems={data.total}
    onRowClick={(row) => goto(`/budgets/${row.id}`)}
  />
</div>
