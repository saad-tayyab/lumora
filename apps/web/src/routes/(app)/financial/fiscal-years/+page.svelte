<script lang="ts">
import type { FiscalYearStatus } from '$lib/types';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const statusBadgeColors: Record<FiscalYearStatus, string> = {
  open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Fiscal Years</h1>
      <p class="mt-1 text-muted-foreground">Manage fiscal year periods and closing</p>
    </div>
    <a
      href="/financial/fiscal-years/new"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Fiscal Year
    </a>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Start Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">End Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if data.fiscalYears.length === 0}
            <tr>
              <td colspan="5" class="px-4 py-8 text-center text-muted-foreground">
                No fiscal years found
              </td>
            </tr>
          {:else}
            {#each data.fiscalYears as fy (fy.id)}
              <tr class="border-b last:border-b-0 hover:bg-muted/30">
                <td class="px-4 py-3 font-medium text-foreground">{fy.name}</td>
                <td class="px-4 py-3 text-foreground">{formatDate(fy.startDate)}</td>
                <td class="px-4 py-3 text-foreground">{formatDate(fy.endDate)}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColors[fy.status]}">
                    {fy.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  {#if fy.status === 'open'}
                    <span class="text-sm text-muted-foreground">Active</span>
                  {:else}
                    <span class="text-sm text-muted-foreground">Closed</span>
                  {/if}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <div class="text-sm text-muted-foreground">
    Showing {data.fiscalYears.length} fiscal year{data.fiscalYears.length !== 1 ? 's' : ''}
  </div>
</div>
