<script lang="ts">
import { onMount } from 'svelte';
import * as assetApi from '$lib/api/asset';
import { formatCurrency, formatDate } from '$lib/utils/format';

let stats = $state({
  totalAssets: 0,
  totalValue: '0',
  totalAccumulatedDepreciation: '0',
  draftEntries: 0,
  pendingAdjustments: 0,
});
let loading = $state(true);

onMount(async () => {
  try {
    const [assets, entries, adjustments] = await Promise.all([
      assetApi.listFixedAssets({ limit: 1 }),
      assetApi.listDepreciationEntries({ limit: 1 }),
      assetApi.listAssetAdjustments({ limit: 1 }),
    ]);
    stats.totalAssets = assets.total;
    stats.draftEntries = entries.total;
    stats.pendingAdjustments = adjustments.total;
  } catch (e) {
    console.error(e);
  } finally {
    loading = false;
  }
});
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Fixed Assets</h1>
    <p class="text-muted-foreground">Manage fixed assets, depreciation, and adjustments</p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading...</div>
    </div>
  {:else}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <div class="text-sm font-medium text-muted-foreground">Total Assets</div>
        <div class="mt-2 text-3xl font-bold text-card-foreground">{stats.totalAssets}</div>
      </div>
      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <div class="text-sm font-medium text-muted-foreground">Depreciation Entries</div>
        <div class="mt-2 text-3xl font-bold text-card-foreground">{stats.draftEntries}</div>
      </div>
      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <div class="text-sm font-medium text-muted-foreground">Pending Adjustments</div>
        <div class="mt-2 text-3xl font-bold text-card-foreground">{stats.pendingAdjustments}</div>
      </div>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h2>
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <a
          href="/assets/categories/new"
          class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
        >
          New Category
        </a>
        <a
          href="/assets/fixed-assets/new"
          class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
        >
          New Asset
        </a>
        <a
          href="/assets/depreciation-entries"
          class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
        >
          Depreciation Entries
        </a>
        <a
          href="/assets/adjustments/new"
          class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
        >
          New Adjustment
        </a>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <a href="/assets/categories" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
        <h3 class="font-semibold text-card-foreground">Asset Categories</h3>
        <p class="mt-1 text-sm text-muted-foreground">Manage asset categories and depreciation defaults</p>
      </a>
      <a href="/assets/fixed-assets" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
        <h3 class="font-semibold text-card-foreground">Fixed Asset Register</h3>
        <p class="mt-1 text-sm text-muted-foreground">View and manage all fixed assets</p>
      </a>
      <a href="/assets/depreciation" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
        <h3 class="font-semibold text-card-foreground">Depreciation Schedules</h3>
        <p class="mt-1 text-sm text-muted-foreground">View depreciation schedules</p>
      </a>
      <a href="/assets/adjustments" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
        <h3 class="font-semibold text-card-foreground">Asset Adjustments</h3>
        <p class="mt-1 text-sm text-muted-foreground">Revaluation, impairment, and transfers</p>
      </a>
    </div>
  {/if}
</div>
