<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll, goto } from '$app/navigation';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import { Badge } from '$lib/components/ui/badge';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

async function handleDelete(id: string) {
  if (!confirm('Delete this category?')) return;
  deleting = id;
  try {
    const { deleteAssetCategory } = await import('$lib/api/asset');
    await deleteAssetCategory(id);
    toast.success('Category deleted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete');
  } finally {
    deleting = null;
  }
}

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    straight_line: 'Straight Line',
    declining_balance: 'Declining Balance',
    sum_of_years_digits: 'Sum of Years Digits',
    units_of_activity: 'Units of Activity',
  };
  return labels[method] || method;
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'code', header: 'Code', cell: (row) => `<span class="font-mono text-xs">${(row as any).original.code}</span>` },
  { accessorKey: 'name', header: 'Name', cell: (row) => `<span class="font-medium">${(row as any).original.name}</span>` },
  {
    accessorKey: 'isDepreciable',
    header: 'Depreciable',
    cell: (row) => (row as any).original.isDepreciable
      ? '<Badge variant="default">Depreciable</Badge>'
      : '<Badge variant="outline">Non-depreciable</Badge>',
  },
  { accessorKey: 'defaultDepreciationMethod', header: 'Method', cell: (row) => methodLabel((row as any).original.defaultDepreciationMethod) },
  { accessorKey: 'defaultUsefulLifeMonths', header: 'Useful Life', cell: (row) => `${(row as any).original.defaultUsefulLifeMonths} mo` },
  { accessorKey: 'defaultSalvageValuePercent', header: 'Salvage %', cell: (row) => `${(row as any).original.defaultSalvageValuePercent}%` },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: (row) => `<span class="${badgeVariants({ variant: (row as any).original.isActive ? 'secondary' : 'outline' })}">${(row as any).original.isActive ? 'Active' : 'Inactive'}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<div class="flex items-center justify-end gap-2"><a href="/assets/categories/${(row as any).original.id}" class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">Edit</a><button onclick="window.dispatchEvent(new CustomEvent('delete-category', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button></div>`,
  },
];

$effect(() => {
  const handler = (e: Event) => handleDelete((e as CustomEvent).detail);
  window.addEventListener('delete-category', handler);
  return () => window.removeEventListener('delete-category', handler);
});
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Asset Categories</h1>
      <p class="text-muted-foreground">{data.total} categories</p>
    </div>
    <a
      href="/assets/categories/new"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Category
    </a>
  </div>

  <AppDataTable
    {columns}
    data={data.categories}
    emptyMessage="No categories found"
    pageSize={20}
    totalItems={data.total}
    onRowClick={(row) => goto(`/assets/categories/${row.id}`)}
  />
</div>
