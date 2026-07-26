<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

async function handleDelete(id: string) {
  if (!confirm('Delete this asset?')) return;
  deleting = id;
  try {
    const { deleteFixedAsset } = await import('$lib/api/asset');
    await deleteFixedAsset(id);
    toast.success('Asset deleted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete');
  } finally {
    deleting = null;
  }
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

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    straight_line: 'SL',
    declining_balance: 'DB',
    sum_of_years_digits: 'SYD',
    units_of_activity: 'UoA',
  };
  return labels[method] || method;
}
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Fixed Assets</h1>
      <p class="text-muted-foreground">{data.total} assets</p>
    </div>
    <a
      href="/assets/fixed-assets/new"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Asset
    </a>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Asset #</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Acquired</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Cost</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Acc. Depreciation</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">NBV</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Method</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.assets as asset}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 font-mono text-xs">{asset.assetNumber}</td>
              <td class="px-4 py-3">
                <a href="/assets/fixed-assets/{asset.id}" class="font-medium hover:underline">{asset.name}</a>
              </td>
              <td class="px-4 py-3">{formatDate(asset.acquisitionDate)}</td>
              <td class="px-4 py-3 text-right">{formatCurrency(asset.acquisitionCost)}</td>
              <td class="px-4 py-3 text-right">{formatCurrency(asset.accumulatedDepreciation)}</td>
              <td class="px-4 py-3 text-right font-medium">{formatCurrency(asset.netBookValue)}</td>
              <td class="px-4 py-3">{methodLabel(asset.depreciationMethod)}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusColor(asset.status)}">
                  {asset.status.replace('_', ' ')}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <a
                    href="/assets/fixed-assets/{asset.id}/edit"
                    class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Edit
                  </a>
                  <button
                    onclick={() => handleDelete(asset.id)}
                    disabled={deleting === asset.id}
                    class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="9" class="px-4 py-12 text-center text-muted-foreground">No assets found</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
