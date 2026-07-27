<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let posting = $state<string | null>(null);
let voiding = $state<string | null>(null);

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
    const { postDepreciationEntry } = await import('$lib/api/asset');
    await postDepreciationEntry(id, { journalEntryId: crypto.randomUUID() });
    toast.success('Entry posted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to post');
  } finally {
    posting = null;
  }
}

async function handleVoid(id: string) {
  if (!confirm('Void this entry?')) return;
  voiding = id;
  try {
    const { voidDepreciationEntry } = await import('$lib/api/asset');
    await voidDepreciationEntry(id);
    toast.success('Entry voided');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to void');
  } finally {
    voiding = null;
  }
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'assetId', header: 'Asset ID', cell: (row) => `<span class="font-mono text-xs">${(row as any).original.assetId.slice(0, 8)}...</span>` },
  { accessorKey: 'periodStartDate', header: 'Period', cell: (row) => `${formatDate((row as any).original.periodStartDate)} - ${formatDate((row as any).original.periodEndDate)}` },
  { accessorKey: 'depreciationAmount', header: 'Amount', cell: (row) => `<span class="text-right">${formatCurrency((row as any).original.depreciationAmount)}</span>` },
  { accessorKey: 'accumulatedDepreciation', header: 'Acc. Depreciation', cell: (row) => `<span class="text-right">${formatCurrency((row as any).original.accumulatedDepreciation)}</span>` },
  { accessorKey: 'netBookValue', header: 'NBV', cell: (row) => `<span class="text-right font-medium">${formatCurrency((row as any).original.netBookValue)}</span>` },
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
      return `<div class="flex items-center justify-end gap-2"><button onclick="window.dispatchEvent(new CustomEvent('post-dep-entry', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50 dark:text-green-400">Post</button><button onclick="window.dispatchEvent(new CustomEvent('void-dep-entry', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Void</button></div>`;
    },
  },
];

$effect(() => {
  const handler = (e: Event) => handlePost((e as CustomEvent).detail);
  window.addEventListener('post-dep-entry', handler);
  return () => window.removeEventListener('post-dep-entry', handler);
});
$effect(() => {
  const handler = (e: Event) => handleVoid((e as CustomEvent).detail);
  window.addEventListener('void-dep-entry', handler);
  return () => window.removeEventListener('void-dep-entry', handler);
});
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Depreciation Entries</h1>
      <p class="text-muted-foreground">{data.total} entries</p>
    </div>
  </div>

  <AppDataTable
    {columns}
    data={data.entries}
    emptyMessage="No entries found"
    pageSize={20}
    totalItems={data.total}
  />
</div>
