<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let posting = $state<string | null>(null);
let voiding = $state<string | null>(null);

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
    const { postDepreciationEntry } = await import('$lib/api/asset');
    await postDepreciationEntry(id, { journalEntryId: crypto.randomUUID() });
    toast.success('Entry posted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to post');
  } finally {
    posting = null;
  }
}

async function handleVoid(id: string) {
  if (!confirm('Void this entry?')) return;
  voiding = id;
  try {
    const { voidDepreciationEntry } = await import('$lib/api/asset');
    await voidDepreciationEntry(id);
    toast.success('Entry voided');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to void');
  } finally {
    voiding = null;
  }
}
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Depreciation Entries</h1>
      <p class="text-muted-foreground">{data.total} entries</p>
    </div>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Asset ID</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Period</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Acc. Depreciation</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">NBV</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.entries as entry}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 font-mono text-xs">{entry.assetId.slice(0, 8)}...</td>
              <td class="px-4 py-3">{formatDate(entry.periodStartDate)} - {formatDate(entry.periodEndDate)}</td>
              <td class="px-4 py-3 text-right">{formatCurrency(entry.depreciationAmount)}</td>
              <td class="px-4 py-3 text-right">{formatCurrency(entry.accumulatedDepreciation)}</td>
              <td class="px-4 py-3 text-right font-medium">{formatCurrency(entry.netBookValue)}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusColor(entry.status)}">
                  {entry.status}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  {#if entry.status === 'draft'}
                    <button
                      onclick={() => handlePost(entry.id)}
                      disabled={posting === entry.id}
                      class="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50 dark:text-green-400"
                    >
                      Post
                    </button>
                    <button
                      onclick={() => handleVoid(entry.id)}
                      disabled={voiding === entry.id}
                      class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      Void
                    </button>
                  {/if}
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-4 py-12 text-center text-muted-foreground">No entries found</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
