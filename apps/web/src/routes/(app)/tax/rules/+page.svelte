<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

function codeName(codeId: string): string {
  const c = data.codes.find((c: any) => c.id === codeId);
  return c ? c.name : codeId.slice(0, 8);
}

async function handleDelete(id: string) {
  if (!confirm('Delete this rule?')) return;
  deleting = id;
  try {
    const { deleteAutoAssignmentRule } = await import('$lib/api/tax');
    await deleteAutoAssignmentRule(id);
    toast.success('Rule deleted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete');
  } finally {
    deleting = null;
  }
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'priority', header: 'Priority', cell: (row) => `<span class="font-mono">${(row as any).original.priority}</span>` },
  { accessorKey: 'name', header: 'Name', cell: (row) => `<span class="font-medium">${(row as any).original.name}</span>` },
  { accessorKey: 'entityType', header: 'Entity Type', cell: (row) => (row as any).original.entityType },
  { accessorKey: 'taxCodeId', header: 'Tax Code', cell: (row) => codeName((row as any).original.taxCodeId) },
  { accessorKey: 'regionCode', header: 'Region', cell: (row) => (row as any).original.regionCode || '—' },
  {
    accessorKey: 'isActive',
    header: 'Active',
    cell: (row) => (row as any).original.isActive
      ? '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</span>'
      : '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Inactive</span>',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<button onclick="window.dispatchEvent(new CustomEvent('delete-taxrule', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button>`,
  },
];

$effect(() => {
  const handler = (e: Event) => handleDelete((e as CustomEvent).detail);
  window.addEventListener('delete-taxrule', handler);
  return () => window.removeEventListener('delete-taxrule', handler);
});
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Auto-Assignment Rules</h1>
      <p class="text-muted-foreground">{data.total} rules</p>
    </div>
    <Button href="/tax/rules/new">New Rule</Button>
  </div>

  <AppDataTable
    {columns}
    data={data.rules}
    emptyMessage="No rules found"
    pageSize={20}
    totalItems={data.total}
  />
</div>
