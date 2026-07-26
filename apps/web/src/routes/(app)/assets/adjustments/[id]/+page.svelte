<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    revaluation: 'Revaluation',
    impairment: 'Impairment',
    restoration: 'Restoration',
    transfer: 'Transfer',
    reclassification: 'Reclassification',
  };
  return labels[type] || type;
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    posted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    voided: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
</script>

{#if data.adjustment}
  {@const adj = data.adjustment}
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{typeLabel(adj.adjustmentType)}</h1>
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusColor(adj.status)}">
            {adj.status}
          </span>
        </div>
        <p class="text-muted-foreground">Asset: {adj.assetId}</p>
      </div>
      <div class="flex gap-2">
        <a
          href="/assets/adjustments"
          class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Back to List
        </a>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-semibold text-card-foreground">Adjustment Details</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Type</dt>
            <dd class="font-medium">{typeLabel(adj.adjustmentType)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Direction</dt>
            <dd class="font-medium capitalize">{adj.direction}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Amount</dt>
            <dd class="font-medium">{formatCurrency(adj.adjustmentAmount)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Date</dt>
            <dd class="font-medium">{formatDate(adj.adjustmentDate)}</dd>
          </div>
        </dl>
      </div>

      <div class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-semibold text-card-foreground">Additional Info</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Status</dt>
            <dd>
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusColor(adj.status)}">
                {adj.status}
              </span>
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Journal Entry</dt>
            <dd class="font-medium">{adj.journalEntryId || '—'}</dd>
          </div>
          {#if adj.revisedUsefulLifeMonths}
            <div class="flex justify-between">
              <dt class="text-muted-foreground">Revised Useful Life</dt>
              <dd class="font-medium">{adj.revisedUsefulLifeMonths} months</dd>
            </div>
          {/if}
          {#if adj.revisedSalvageValue}
            <div class="flex justify-between">
              <dt class="text-muted-foreground">Revised Salvage Value</dt>
              <dd class="font-medium">{formatCurrency(adj.revisedSalvageValue)}</dd>
            </div>
          {/if}
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Created</dt>
            <dd class="font-medium">{formatDate(adj.createdAt)}</dd>
          </div>
        </dl>
      </div>
    </div>

    {#if adj.description}
      <div class="rounded-lg border bg-card p-6 shadow-sm space-y-2">
        <h2 class="text-lg font-semibold text-card-foreground">Description</h2>
        <p class="text-sm text-muted-foreground">{adj.description}</p>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex items-center justify-center py-12">
    <div class="text-muted-foreground">Adjustment not found</div>
  </div>
{/if}
