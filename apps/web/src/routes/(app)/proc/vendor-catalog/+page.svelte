<script lang="ts">
import { toast } from 'svelte-sonner';
import { procApi, type VendorCatalogItem } from '$lib/api/proc';
import { formatCurrency } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

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

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    {#if items.length === 0}
      <div class="py-12 text-center">
        <p class="text-muted-foreground">No catalog items found</p>
        <a href="/proc/vendor-catalog/new" class="mt-4 inline-block text-sm text-primary hover:underline">
          Add your first catalog item
        </a>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vendor</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Item</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vendor SKU</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Unit Price</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Lead Time (days)</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Min Order Qty</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each items as item}
              <tr class="border-b hover:bg-muted/30">
                <td class="px-4 py-3 text-sm font-medium">{item.vendorName}</td>
                <td class="px-4 py-3 text-sm">{item.itemName}</td>
                <td class="px-4 py-3 text-sm text-muted-foreground">{item.vendorSku || '-'}</td>
                <td class="px-4 py-3 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                <td class="px-4 py-3 text-right text-sm">{item.leadTimeDays ?? '-'}</td>
                <td class="px-4 py-3 text-right text-sm">{item.minimumOrderQuantity || '-'}</td>
                <td class="px-4 py-3 text-right">
                  <button
                    onclick={() => deleteItem(item.id)}
                    class="text-sm text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Card.Content></Card.Root>
</div>
