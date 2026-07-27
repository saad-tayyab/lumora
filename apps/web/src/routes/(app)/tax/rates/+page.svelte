<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import { badgeVariants } from '$lib/components/ui/badge';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

function codeName(codeId: string): string {
  const c = data.codes.find((c: any) => c.id === codeId);
  return c ? `${c.name} (${c.code})` : codeId.slice(0, 8);
}

async function handleDelete(id: string) {
  if (!confirm('Delete this tax rate?')) return;
  deleting = id;
  try {
    const { deleteTaxRate } = await import('$lib/api/tax');
    await deleteTaxRate(id);
    toast.success('Tax rate deleted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete');
  } finally {
    deleting = null;
  }
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'taxCodeId', header: 'Tax Code', cell: (row) => codeName((row as any).original.taxCodeId) },
  { accessorKey: 'rate', header: 'Rate', cell: (row) => `<span class="text-right font-mono">${(parseFloat((row as any).original.rate) * 100).toFixed(2)}%</span>` },
  { accessorKey: 'effectiveDate', header: 'Effective Date', cell: (row) => formatDate((row as any).original.effectiveDate) },
  { accessorKey: 'expiryDate', header: 'Expiry Date', cell: (row) => (row as any).original.expiryDate ? formatDate((row as any).original.expiryDate) : '—' },
  {
    accessorKey: 'isActive',
    header: 'Active',
    cell: (row) => `<span class="${badgeVariants({ variant: (row as any).original.isActive ? 'secondary' : 'outline' })}">${(row as any).original.isActive ? 'Active' : 'Inactive'}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<button onclick="window.dispatchEvent(new CustomEvent('delete-taxrate', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button>`,
  },
];

$effect(() => {
  const handler = (e: Event) => handleDelete((e as CustomEvent).detail);
  window.addEventListener('delete-taxrate', handler);
  return () => window.removeEventListener('delete-taxrate', handler);
});
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Tax Rates</h1>
      <p class="text-muted-foreground">{data.total} rates</p>
    </div>
    <Button href="/tax/rates/new">New Tax Rate</Button>
  </div>

  <AppDataTable
    {columns}
    data={data.rates}
    emptyMessage="No tax rates found"
    pageSize={20}
    totalItems={data.total}
  />
</div>
