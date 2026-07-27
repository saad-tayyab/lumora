<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let posting = $state<string | null>(null);

function statusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'draft': return 'outline';
    case 'posted': return 'secondary';
    case 'voided': return 'destructive';
    default: return 'outline';
  }
}

async function handlePost(id: string) {
  posting = id;
  try {
    const { postAssetAdjustment } = await import('$lib/api/asset');
    await postAssetAdjustment(id, { journalEntryId: crypto.randomUUID() });
    toast.success('Adjustment posted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to post');
  } finally {
    posting = null;
  }
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'assetId', header: 'Asset ID', cell: (row) => `<span class="font-mono text-xs">${(row as any).original.assetId.slice(0, 8)}...</span>` },
  { accessorKey: 'adjustmentType', header: 'Type', cell: (row) => `<span class="capitalize">${(row as any).original.adjustmentType}</span>` },
  {
    accessorKey: 'direction',
    header: 'Direction',
    cell: (row) => `<span class="${(row as any).original.direction === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">${(row as any).original.direction}</span>`,
  },
  { accessorKey: 'adjustmentAmount', header: 'Amount', cell: (row) => `<span class="text-right">${formatCurrency((row as any).original.adjustmentAmount)}</span>` },
  { accessorKey: 'adjustmentDate', header: 'Date', cell: (row) => formatDate((row as any).original.adjustmentDate) },
  { accessorKey: 'description', header: 'Description', cell: (row) => `<span class="max-w-[200px] truncate">${(row as any).original.description}</span>` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusVariant((row as any).original.status)}">${(row as any).original.status}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => {
      if ((row as any).original.status !== 'draft') return '';
      return `<button onclick="window.dispatchEvent(new CustomEvent('post-adj', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50 dark:text-green-400">Post</button>`;
    },
  },
];

$effect(() => {
  const handler = (e: Event) => handlePost((e as CustomEvent).detail);
  window.addEventListener('post-adj', handler);
  return () => window.removeEventListener('post-adj', handler);
});
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Asset Adjustments</h1>
      <p class="text-muted-foreground">{data.total} adjustments</p>
    </div>
    <a
      href="/assets/adjustments/new"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Adjustment
    </a>
  </div>

  <AppDataTable
    {columns}
    data={data.adjustments}
    emptyMessage="No adjustments found"
    pageSize={20}
    totalItems={data.total}
  />
</div>
