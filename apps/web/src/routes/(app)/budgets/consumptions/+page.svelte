<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Budget Consumptions</h1>
    <p class="text-muted-foreground">{data.total} consumptions</p>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Budget Line</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Journal Entry</th>
          </tr>
        </thead>
        <tbody>
          {#each data.consumptions as c}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 font-mono text-xs">{c.budgetLineId.slice(0, 8)}...</td>
              <td class="px-4 py-3 text-right font-medium">{formatCurrency(c.amount)}</td>
              <td class="px-4 py-3">{formatDate(c.consumptionDate)}</td>
              <td class="px-4 py-3">{c.description || '—'}</td>
              <td class="px-4 py-3 font-mono text-xs">{c.journalEntryId ? c.journalEntryId.slice(0, 8) + '...' : '—'}</td>
            </tr>
          {:else}
            <tr><td colspan="5" class="px-4 py-12 text-center text-muted-foreground">No consumptions found</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content></Card.Root>
</div>
