<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    straight_line: 'Straight Line',
    declining_balance: 'Declining Balance',
    sum_of_years_digits: 'Sum of Years Digits',
    units_of_production: 'Units of Production',
  };
  return labels[method] || method;
}
</script>

{#if data.schedule}
  {@const sched = data.schedule}
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Depreciation Schedule</h1>
        <p class="text-muted-foreground">Asset: {sched.assetId}</p>
      </div>
      <a
        href="/assets/depreciation"
        class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        Back to List
      </a>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-semibold text-card-foreground">Schedule Details</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Asset</dt>
            <dd class="font-medium">{sched.assetId}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Method</dt>
            <dd class="font-medium">{methodLabel(sched.method)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Status</dt>
            <dd class="font-medium capitalize">{sched.status}</dd>
          </div>
        </dl>
      </div>

      <div class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-semibold text-card-foreground">Financials</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Start Date</dt>
            <dd class="font-medium">{formatDate(sched.startDate)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">End Date</dt>
            <dd class="font-medium">{formatDate(sched.endDate)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Total Depreciable Cost</dt>
            <dd class="font-medium">{formatCurrency(sched.totalDepreciableCost)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Monthly Amount</dt>
            <dd class="text-lg font-bold">{formatCurrency(sched.monthlyAmount)}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center py-12">
    <div class="text-muted-foreground">Schedule not found</div>
  </div>
{/if}
