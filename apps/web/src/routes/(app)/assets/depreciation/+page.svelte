<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    straight_line: 'Straight Line',
    declining_balance: 'Declining Balance',
    sum_of_years_digits: 'Sum of Years Digits',
    units_of_activity: 'Units of Activity',
  };
  return labels[method] || method;
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Depreciation Schedules</h1>
    <p class="text-muted-foreground">{data.total} schedules</p>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Asset ID</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Start Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">End Date</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Total Depreciable</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Monthly Amount</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Method</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each data.schedules as schedule}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 font-mono text-xs">{schedule.assetId.slice(0, 8)}...</td>
              <td class="px-4 py-3">{formatDate(schedule.startDate)}</td>
              <td class="px-4 py-3">{formatDate(schedule.endDate)}</td>
              <td class="px-4 py-3 text-right">{formatCurrency(schedule.totalDepreciableCost)}</td>
              <td class="px-4 py-3 text-right font-medium">{formatCurrency(schedule.monthlyAmount)}</td>
              <td class="px-4 py-3">{methodLabel(schedule.method)}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {schedule.status}
                </span>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-4 py-12 text-center text-muted-foreground">No schedules found</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content></Card.Root>
</div>
