<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Badge } from '$lib/components/ui/badge';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Financial Reports</h1>
    <p class="text-muted-foreground">Account summaries and journal entry history</p>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="border-b p-4">
      <h2 class="text-lg font-semibold text-card-foreground">Chart of Accounts</h2>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-t bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Balance</th>
          </tr>
        </thead>
        <tbody>
          {#each data.accounts as account (account.id)}
            <tr class="border-t hover:bg-muted/30">
              <td class="px-4 py-3 font-medium">{account.code}</td>
              <td class="px-4 py-3 text-card-foreground">{account.name}</td>
              <td class="px-4 py-3 text-muted-foreground">{account.type}</td>
              <td class="px-4 py-3 text-right font-medium">
                {formatCurrency(account.balance || '0')}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="4" class="px-4 py-8 text-center text-muted-foreground">
                No accounts found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="border-b p-4">
      <h2 class="text-lg font-semibold text-card-foreground">Recent Journal Entries</h2>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-t bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Debit</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Credit</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each data.journalEntries as entry (entry.id)}
            <tr class="border-t hover:bg-muted/30">
              <td class="px-4 py-3 text-muted-foreground">{formatDate(entry.entryDate)}</td>
              <td class="px-4 py-3 font-medium">{entry.description}</td>
              <td class="px-4 py-3 text-right">{formatCurrency(entry.totalDebit)}</td>
              <td class="px-4 py-3 text-right">{formatCurrency(entry.totalCredit)}</td>
              <td class="px-4 py-3">
                <Badge variant={entry.status === 'posted' ? 'secondary' : entry.status === 'draft' ? 'outline' : 'outline'}>
                  {entry.status}
                </Badge>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="px-4 py-8 text-center text-muted-foreground">
                No journal entries found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
