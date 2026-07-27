<script lang="ts">
import { enhance } from '$app/forms';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let posting = $state(false);
let voiding = $state(false);

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    posted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    voided: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
</script>

{#if data.entry}
  {@const entry = data.entry}
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">Depreciation Entry</h1>
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusColor(entry.status)}">
            {entry.status}
          </span>
        </div>
        <p class="text-muted-foreground">Asset: {entry.assetId}</p>
      </div>
      <a
        href="/assets/depreciation-entries"
        class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        Back to List
      </a>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <Card.Root class="shadow-sm"><Card.Content>
        <h2 class="text-lg font-semibold text-card-foreground">Entry Details</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Asset</dt>
            <dd class="font-medium">{entry.assetId}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Schedule</dt>
            <dd class="font-medium">{entry.scheduleId || '—'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Period Start</dt>
            <dd class="font-medium">{formatDate(entry.periodStartDate)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Period End</dt>
            <dd class="font-medium">{formatDate(entry.periodEndDate)}</dd>
          </div>
        </dl>
      </Card.Content></Card.Root>

      <Card.Root class="shadow-sm"><Card.Content>
        <h2 class="text-lg font-semibold text-card-foreground">Financials</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Depreciation Amount</dt>
            <dd class="text-lg font-bold">{formatCurrency(entry.depreciationAmount)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Accumulated Depreciation</dt>
            <dd class="font-medium">{formatCurrency(entry.accumulatedDepreciation)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Net Book Value</dt>
            <dd class="font-medium">{formatCurrency(entry.netBookValue)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Journal Entry</dt>
            <dd class="font-medium">{entry.journalEntryId || '—'}</dd>
          </div>
        </dl>
      </Card.Content></Card.Root>
    </div>

    {#if entry.status === 'draft'}
      <div class="flex gap-3">
        <form method="POST" action="?/post" use:enhance={() => {
          posting = true;
          return async ({ update }) => {
            posting = false;
            await update();
          };
        }}>
          <button
            type="submit"
            disabled={posting}
            class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {posting ? 'Posting...' : 'Post Entry'}
          </button>
        </form>

        <form method="POST" action="?/void" use:enhance={() => {
          voiding = true;
          return async ({ update }) => {
            voiding = false;
            await update();
          };
        }}>
          <button
            type="submit"
            disabled={voiding}
            class="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            {voiding ? 'Voiding...' : 'Void Entry'}
          </button>
        </form>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex items-center justify-center py-12">
    <div class="text-muted-foreground">Entry not found</div>
  </div>
{/if}
