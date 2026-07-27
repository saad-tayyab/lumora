<script lang="ts">
  import { KpiCard } from '$lib/components/dashboard';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { formatCurrency, formatNumber } from '$lib/utils/format';
  import {
    Package,
    Warehouse,
    FolderOpen,
    ArrowRightLeft,
    Plus,
    AlertTriangle,
  } from '@lucide/svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Inventory</h1>
    <p class="text-muted-foreground">Manage items, warehouses, and stock</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <KpiCard
      title="Items"
      value={data.itemCount}
      subtitle="Products tracked"
      icon={Package}
    />
    <KpiCard
      title="Warehouses"
      value={data.warehouseCount}
      subtitle="Storage locations"
      icon={Warehouse}
    />
    <KpiCard
      title="Categories"
      value={data.categoryCount}
      subtitle="Item groupings"
      icon={FolderOpen}
    />
    <KpiCard
      title="Stock Movements"
      value={data.movementCount}
      subtitle="Recent transactions"
      icon={ArrowRightLeft}
    />
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center justify-between">
          <span>Recent Items</span>
          <a href="/inv/items" class="text-sm text-primary hover:underline">View all</a>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {#if data.recentItems.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No items yet.</p>
        {:else}
          <div class="flex flex-col gap-3">
            {#each data.recentItems as item}
              <a
                href="/inv/items/{item.id}"
                class="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <div>
                  <p class="text-sm font-medium text-card-foreground">{item.name}</p>
                  <p class="text-xs text-muted-foreground">{item.sku}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-card-foreground">{formatCurrency(item.costPrice)}</p>
                  <p class="text-xs text-muted-foreground">UoM: {item.unitOfMeasure}</p>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center gap-2">
          <AlertTriangle class="h-5 w-5 text-yellow-500" />
          Low Stock Alerts
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {#if data.lowStockItems.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">All items are well stocked.</p>
        {:else}
          <div class="flex flex-col gap-3">
            {#each data.lowStockItems as level}
              <div class="flex items-center justify-between rounded-md border border-yellow-200 bg-yellow-50 p-3">
                <div>
                  <p class="text-sm font-medium">{level.itemName}</p>
                  <p class="text-xs text-muted-foreground">{level.warehouseName} &middot; SKU: {level.itemSku}</p>
                </div>
                <p class="text-sm font-medium text-yellow-700">{formatNumber(level.availableQuantity)} available</p>
              </div>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Quick Actions</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" class="justify-start gap-2" href="/inv/items/new">
          <Plus data-icon="inline-start" />
          Add Item
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/inv/warehouses/new">
          <Warehouse data-icon="inline-start" />
          Add Warehouse
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/inv/categories/new">
          <FolderOpen data-icon="inline-start" />
          Add Category
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/inv/stock-movements/new">
          <ArrowRightLeft data-icon="inline-start" />
          Record Movement
        </Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>
