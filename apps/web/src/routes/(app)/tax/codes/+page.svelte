<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll, goto } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import { badgeVariants } from '$lib/components/ui/badge';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

function typeVariant(type: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (type) {
    case 'sales_tax': return 'default';
    case 'vat': return 'secondary';
    case 'gst': return 'secondary';
    case 'excise': return 'outline';
    case 'withholding': return 'destructive';
    default: return 'outline';
  }
}

async function handleDelete(id: string) {
  if (!confirm('Delete this tax code?')) return;
  deleting = id;
  try {
    const { deleteTaxCode } = await import('$lib/api/tax');
    await deleteTaxCode(id);
    toast.success('Tax code deleted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete');
  } finally {
    deleting = null;
  }
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'code', header: 'Code', cell: (row) => `<span class="font-mono text-xs">${(row as any).original.code}</span>` },
  { accessorKey: 'name', header: 'Name', cell: (row) => `<a href="/tax/codes/${(row as any).original.id}" class="font-medium hover:underline">${(row as any).original.name}</a>` },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: (row) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeVariant((row as any).original.type)}">${(row as any).original.type.replace('_', ' ')}</span>`,
  },
  { accessorKey: 'postingRule', header: 'Posting Rule', cell: (row) => (row as any).original.postingRule.replace('_', ' ') },
  { accessorKey: 'isClaimable', header: 'Claimable', cell: (row) => (row as any).original.isClaimable ? 'Yes' : 'No' },
  {
    accessorKey: 'isActive',
    header: 'Active',
    cell: (row) => `<span class="${badgeVariants({ variant: (row as any).original.isActive ? 'secondary' : 'outline' })}">${(row as any).original.isActive ? 'Active' : 'Inactive'}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<div class="flex items-center justify-end gap-2"><a href="/tax/codes/${(row as any).original.id}" class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">Edit</a><button onclick="window.dispatchEvent(new CustomEvent('delete-taxcode', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button></div>`,
  },
];

$effect(() => {
  const handler = (e: Event) => handleDelete((e as CustomEvent).detail);
  window.addEventListener('delete-taxcode', handler);
  return () => window.removeEventListener('delete-taxcode', handler);
});
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Tax Codes</h1>
      <p class="text-muted-foreground">{data.total} codes</p>
    </div>
    <a
      href="/tax/codes/new"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Tax Code
    </a>
  </div>

  <AppDataTable
    {columns}
    data={data.codes}
    emptyMessage="No tax codes found"
    pageSize={20}
    totalItems={data.total}
    onRowClick={(row) => goto(`/tax/codes/${row.id}`)}
  />
</div>
