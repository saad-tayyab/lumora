<script lang="ts">
import { formatNumber } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Operational Reports</h1>
    <p class="text-muted-foreground">Inventory and stock level summaries</p>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="border-b p-4">
      <h2 class="text-lg font-semibold text-card-foreground">Items</h2>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-t bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
          </tr>
        </thead>
        <tbody>
          {#each data.items as item (item.id)}
            <tr class="border-t hover:bg-muted/30">
              <td class="px-4 py-3 font-medium">{item.sku}</td>
              <td class="px-4 py-3 text-card-foreground">{item.name}</td>
              <td class="px-4 py-3 text-muted-foreground">{item.categoryName || '-'}</td>
            </tr>
          {:else}
            <tr>
              <td colspan="3" class="px-4 py-8 text-center text-muted-foreground">
                No items found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="border-b p-4">
      <h2 class="text-lg font-semibold text-card-foreground">Stock Levels</h2>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-t bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Item</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Warehouse</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {#each data.stockLevels as level (level.id)}
            <tr class="border-t hover:bg-muted/30">
              <td class="px-4 py-3 font-medium">{level.itemName || level.itemId}</td>
              <td class="px-4 py-3 text-muted-foreground">{level.warehouseName || level.warehouseId}</td>
              <td class="px-4 py-3 text-right font-medium">{formatNumber(level.quantity, 0)}</td>
            </tr>
          {:else}
            <tr>
              <td colspan="3" class="px-4 py-8 text-center text-muted-foreground">
                No stock levels found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
