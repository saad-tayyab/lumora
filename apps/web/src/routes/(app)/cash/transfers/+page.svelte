<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const transferStatusColor: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  processing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Transfers</h1>
      <p class="text-muted-foreground">Bank account transfers</p>
    </div>
    <Button href="/cash/transfers/new">New Transfer</Button>
  </div>

  <Card>
    <CardContent>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-t bg-muted/50">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">From</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">To</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Reference</th>
            </tr>
          </thead>
          <tbody>
            {#each data.transfers as transfer (transfer.id)}
              <tr class="border-t hover:bg-muted/30">
                <td class="px-4 py-3 font-medium">{transfer.fromAccountName || '-'}</td>
                <td class="px-4 py-3 font-medium">{transfer.toAccountName || '-'}</td>
                <td class="px-4 py-3 text-muted-foreground">{formatDate(transfer.transferDate)}</td>
                <td class="px-4 py-3 text-right font-medium">{formatCurrency(transfer.amount)}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {transferStatusColor[transfer.status] || 'bg-gray-100 text-gray-800'}">
                    {transfer.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-muted-foreground">{transfer.reference || '-'}</td>
              </tr>
            {:else}
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
                  No transfers found.
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</div>
