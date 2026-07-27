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

async function handleDelete(id: string) {
  if (!confirm('Delete this asset?')) return;
  deleting = id;
  try {
    const { deleteFixedAsset } = await import('$lib/api/asset');
    await deleteFixedAsset(id);
    toast.success('Asset deleted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete');
  } finally {
    deleting = null;
  }
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    fully_depreciated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    disposed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    under_construction: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    straight_line: 'SL',
    declining_balance: 'DB',
    sum_of_years_digits: 'SYD',
    units_of_activity: 'UoA',
  };
  return labels[method] || method;
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'assetNumber', header: 'Asset #', cell: (row) => `<span class="font-mono text-xs">${(row as any).original.assetNumber}</span>` },
  { accessorKey: 'name', header: 'Name', cell: (row) => `<a href="/assets/fixed-assets/${(row as any).original.id}" class="font-medium hover:underline">${(row as any).original.name}</a>` },
  { accessorKey: 'acquisitionDate', header: 'Acquired', cell: (row) => formatDate((row as any).original.acquisitionDate) },
  { accessorKey: 'acquisitionCost', header: 'Cost', cell: (row) => `<span class="text-right">${formatCurrency((row as any).original.acquisitionCost)}</span>` },
  { accessorKey: 'accumulatedDepreciation', header: 'Acc. Depreciation', cell: (row) => `<span class="text-right">${formatCurrency((row as any).original.accumulatedDepreciation)}</span>` },
  { accessorKey: 'netBookValue', header: 'NBV', cell: (row) => `<span class="text-right font-medium">${formatCurrency((row as any).original.netBookValue)}</span>` },
  { accessorKey: 'depreciationMethod', header: 'Method', cell: (row) => methodLabel((row as any).original.depreciationMethod) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor((row as any).original.status)}">${(row as any).original.status.replace('_', ' ')}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<div class="flex items-center justify-end gap-2"><a href="/assets/fixed-assets/${(row as any).original.id}/edit" class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">Edit</a><button onclick="window.dispatchEvent(new CustomEvent('delete-asset', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button></div>`,
  },
];

$effect(() => {
  const handler = (e: Event) => handleDelete((e as CustomEvent).detail);
  window.addEventListener('delete-asset', handler);
  return () => window.removeEventListener('delete-asset', handler);
});
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Fixed Assets</h1>
      <p class="text-muted-foreground">{data.total} assets</p>
    </div>
    <a
      href="/assets/fixed-assets/new"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Asset
    </a>
  </div>

  <AppDataTable
    {columns}
    data={data.assets}
    emptyMessage="No assets found"
    pageSize={20}
    totalItems={data.total}
    onRowClick={(row) => goto(`/assets/fixed-assets/${row.id}`)}
  />
</div>
