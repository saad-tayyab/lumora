<script lang="ts">
import { formatCurrency, formatNumber } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Inventory</h1>
    <p class="text-muted-foreground">Manage items, warehouses, and stock</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <a href="/inv/items" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Items</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.itemCount}</div>
    </a>
    <a href="/inv/warehouses" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Warehouses</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.warehouseCount}</div>
    </a>
    <a href="/inv/categories" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Categories</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.categoryCount}</div>
    </a>
    <a href="/inv/stock-movements" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Stock Movements</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.movementCount}</div>
    </a>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Recent Items</h2>
        <a href="/inv/items" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if data.recentItems.length === 0}
        <p class="text-sm text-muted-foreground">No items yet.</p>
      {:else}
        <div class="space-y-3">
          {#each data.recentItems as item}
            <a href="/inv/items/{item.id}" class="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors">
              <div>
                <div class="text-sm font-medium">{item.name}</div>
                <div class="text-xs text-muted-foreground">{item.sku}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{formatCurrency(item.costPrice)}</div>
                <div class="text-xs text-muted-foreground">UoM: {item.unitOfMeasure}</div>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Low Stock Alerts</h2>
      </div>
      {#if data.lowStockItems.length === 0}
        <p class="text-sm text-muted-foreground">All items are well stocked.</p>
      {:else}
        <div class="space-y-3">
          {#each data.lowStockItems as level}
            <div class="flex items-center justify-between rounded-md border border-yellow-200 bg-yellow-50 p-3">
              <div>
                <div class="text-sm font-medium">{level.itemName}</div>
                <div class="text-xs text-muted-foreground">{level.warehouseName} | SKU: {level.itemSku}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-yellow-700">{formatNumber(level.availableQuantity)} available</div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h2>
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <a href="/inv/items/new" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        Add Item
      </a>
      <a href="/inv/warehouses/new" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        Add Warehouse
      </a>
      <a href="/inv/categories/new" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        Add Category
      </a>
      <a href="/inv/stock-movements/new" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        Record Stock Movement
      </a>
    </div>
  </div>
</div>
