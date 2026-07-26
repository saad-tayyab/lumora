<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto, invalidateAll } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import DisposeAssetDialog from '$lib/components/asset/DisposeAssetDialog.svelte';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let disposeOpen = $state(false);
let disposing = $state(false);

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    straight_line: 'Straight Line',
    declining_balance: 'Declining Balance',
    sum_of_years_digits: 'Sum of Years Digits',
    units_of_activity: 'Units of Activity',
  };
  return labels[method] || method;
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    fully_depreciated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    disposed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    under_construction: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

async function handleDispose(detail: { disposalDate: string; disposalProceeds: string }) {
  if (!data.asset) return;
  disposing = true;
  try {
    const { disposeFixedAsset } = await import('$lib/api/asset');
    await disposeFixedAsset(data.asset.id, detail);
    toast.success('Asset disposed');
    disposeOpen = false;
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to dispose');
  } finally {
    disposing = false;
  }
}
</script>

{#if data.asset}
  {@const asset = data.asset}
  <div class="mx-auto max-w-4xl space-y-6">
    <nav class="mb-4 text-sm text-muted-foreground">
      <a href="/assets/fixed-assets" class="hover:underline">Fixed Assets</a>
      <span class="mx-2">/</span>
      <span class="text-foreground">{asset.name}</span>
    </nav>

    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{asset.name}</h1>
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusColor(asset.status)}">
            {asset.status.replace('_', ' ')}
          </span>
        </div>
        <p class="text-muted-foreground">{asset.assetNumber}</p>
      </div>
      <div class="flex gap-2">
        <a
          href="/assets/fixed-assets/{asset.id}/edit"
          class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Edit
        </a>
        <a
          href="/assets/fixed-assets"
          class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Back to List
        </a>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-semibold text-card-foreground">Asset Details</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Category</dt>
            <dd class="font-medium">{asset.categoryId}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Acquisition Date</dt>
            <dd class="font-medium">{formatDate(asset.acquisitionDate)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Acquisition Cost</dt>
            <dd class="font-medium">{formatCurrency(asset.acquisitionCost)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Salvage Value</dt>
            <dd class="font-medium">{formatCurrency(asset.salvageValue)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Useful Life</dt>
            <dd class="font-medium">{asset.usefulLifeMonths} months</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Depreciation Method</dt>
            <dd class="font-medium">{methodLabel(asset.depreciationMethod)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Depreciable</dt>
            <dd class="font-medium">{asset.isDepreciable ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </div>

      <div class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-semibold text-card-foreground">Depreciation</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Accumulated Depreciation</dt>
            <dd class="font-medium">{formatCurrency(asset.accumulatedDepreciation)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Net Book Value</dt>
            <dd class="text-lg font-bold">{formatCurrency(asset.netBookValue)}</dd>
          </div>
        </dl>
      </div>
    </div>

    {#if asset.status === 'active'}
      <div class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-semibold text-card-foreground">Dispose Asset</h2>
        <p class="text-sm text-muted-foreground">
          Permanently dispose this asset. This action will update the depreciation schedule and record any gain or loss.
        </p>
        <button
          onclick={() => (disposeOpen = true)}
          disabled={disposing}
          class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
        >
          Dispose Asset
        </button>
      </div>
    {/if}
  </div>

  <DisposeAssetDialog
    open={disposeOpen}
    asset={{
      name: asset.name,
      assetNumber: asset.assetNumber,
      netBookValue: formatCurrency(asset.netBookValue),
    }}
    onConfirm={handleDispose}
    onCancel={() => (disposeOpen = false)}
  />
{:else}
  <div class="flex items-center justify-center py-12">
    <div class="text-muted-foreground">Asset not found</div>
  </div>
{/if}
