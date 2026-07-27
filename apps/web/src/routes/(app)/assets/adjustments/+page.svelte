<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let posting = $state<string | null>(null);

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    posted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    voided: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

async function handlePost(id: string) {
  posting = id;
  try {
    const { postAssetAdjustment } = await import('$lib/api/asset');
    await postAssetAdjustment(id, { journalEntryId: crypto.randomUUID() });
    toast.success('Adjustment posted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to post');
  } finally {
    posting = null;
  }
}
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Asset Adjustments</h1>
      <p class="text-muted-foreground">{data.total} adjustments</p>
    </div>
    <a
      href="/assets/adjustments/new"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Adjustment
    </a>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Asset ID</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Direction</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.adjustments as adj}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 font-mono text-xs">{adj.assetId.slice(0, 8)}...</td>
              <td class="px-4 py-3 capitalize">{adj.adjustmentType}</td>
              <td class="px-4 py-3">
                <span class={adj.direction === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {adj.direction}
                </span>
              </td>
              <td class="px-4 py-3 text-right">{formatCurrency(adj.adjustmentAmount)}</td>
              <td class="px-4 py-3">{formatDate(adj.adjustmentDate)}</td>
              <td class="px-4 py-3 max-w-[200px] truncate">{adj.description}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusColor(adj.status)}">
                  {adj.status}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                {#if adj.status === 'draft'}
                  <button
                    onclick={() => handlePost(adj.id)}
                    disabled={posting === adj.id}
                    class="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50 dark:text-green-400"
                  >
                    Post
                  </button>
                {/if}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="8" class="px-4 py-12 text-center text-muted-foreground">No adjustments found</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content></Card.Root>
</div>
