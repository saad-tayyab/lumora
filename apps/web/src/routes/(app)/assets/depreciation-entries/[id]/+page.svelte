<script lang="ts">
import { enhance } from '$app/forms';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let posting = $state(false);
let voiding = $state(false);

function statusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'draft': return 'outline';
    case 'posted': return 'secondary';
    case 'voided': return 'destructive';
    default: return 'outline';
  }
}
</script>

{#if data.entry}
  {@const entry = data.entry}
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">Depreciation Entry</h1>
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusVariant(entry.status)}">
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
        <dl class="flex flex-col gap-2 text-sm">
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
        <dl class="flex flex-col gap-2 text-sm">
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
