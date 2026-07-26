<script lang="ts">
import { formatCurrency } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Items</h1>
      <p class="text-muted-foreground">Manage your inventory items</p>
    </div>
    <a
      href="/inv/items/new"
      class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      Add Item
    </a>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="flex items-center gap-4 border-b p-4">
      <input
        type="text"
        placeholder="Search items by name or SKU..."
        class="w-full max-w-sm rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <select class="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="">All Categories</option>
      </select>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-t bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">UoM</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Cost Price</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Sale Price</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.items as item (item.id)}
            <tr class="border-t hover:bg-muted/30">
              <td class="px-4 py-3">
                <a href="/inv/items/{item.id}" class="font-medium text-primary hover:underline">
                  {item.name}
                </a>
              </td>
              <td class="px-4 py-3 text-muted-foreground">{item.sku}</td>
              <td class="px-4 py-3 text-muted-foreground">{item.categoryName || '-'}</td>
              <td class="px-4 py-3 text-muted-foreground">{item.unitOfMeasure}</td>
              <td class="px-4 py-3 text-right">{formatCurrency(item.costPrice)}</td>
              <td class="px-4 py-3 text-right font-medium">{formatCurrency(item.salePrice)}</td>
              <td class="px-4 py-3">
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                  {item.status}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <a href="/inv/items/{item.id}" class="text-primary hover:underline">View</a>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="8" class="px-4 py-8 text-center text-muted-foreground">
                No items found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
