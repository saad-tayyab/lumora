<script lang="ts">
import { toast } from 'svelte-sonner';
import { procApi, type VendorCatalogItem } from '$lib/api/proc';
import { formatCurrency } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let items = $state<VendorCatalogItem[]>(data.items);
let total = $state(data.total);

async function deleteItem(id: string) {
  if (!confirm('Are you sure you want to delete this catalog item?')) return;
  try {
    await procApi.vendorCatalog.delete(id);
    items = items.filter((i) => i.id !== id);
    total--;
    toast.success('Catalog item deleted');
  } catch {
    toast.error('Failed to delete catalog item');
  }
}

const columns: ColumnDef<VendorCatalogItem>[] = [
  { accessorKey: 'vendorName', header: 'Vendor', cell: (row) => `<span class="text-sm font-medium">${(row as any).original.vendorName}</span>` },
  { accessorKey: 'itemName', header: 'Item', cell: (row) => `<span class="text-sm">${(row as any).original.itemName}</span>` },
  { accessorKey: 'vendorSku', header: 'Vendor SKU', cell: (row) => `<span class="text-sm text-muted-foreground">${(row as any).original.vendorSku || '-'}</span>` },
  { accessorKey: 'unitPrice', header: 'Unit Price', cell: (row) => `<span class="text-sm text-right">${formatCurrency((row as any).original.unitPrice)}</span>` },
  { accessorKey: 'leadTimeDays', header: 'Lead Time (days)', cell: (row) => `<span class="text-sm text-right">${(row as any).original.leadTimeDays ?? '-'}</span>` },
  { accessorKey: 'minimumOrderQuantity', header: 'Min Order Qty', cell: (row) => `<span class="text-sm text-right">${(row as any).original.minimumOrderQuantity || '-'}</span>` },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<button onclick="window.dispatchEvent(new CustomEvent('delete-catalog', {detail:'${(row as any).original.id}'}))" class="text-sm text-destructive hover:underline">Delete</button>`,
  },
];

$effect(() => {
  const handler = (e: Event) => deleteItem((e as CustomEvent).detail);
  window.addEventListener('delete-catalog', handler);
  return () => window.removeEventListener('delete-catalog', handler);
});
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Vendor Catalog</h1>
      <p class="text-muted-foreground">Manage vendor product catalog items</p>
    </div>
    <a
      href="/proc/vendor-catalog/new"
      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      Add Catalog Item
    </a>
  </div>

  <AppDataTable
    {columns}
    data={items}
    emptyMessage="No catalog items found"
    pageSize={20}
    totalItems={total}
  />
</div>
