<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const reconStatusColor: Record<string, string> = {
  unmatched: 'bg-gray-100 text-gray-800',
  auto_matched: 'bg-green-100 text-green-800',
  manually_matched: 'bg-blue-100 text-blue-800',
  excluded: 'bg-red-100 text-red-800',
  disputed: 'bg-yellow-100 text-yellow-800',
};

let bankAccountId = $state('');

async function handleAction(action: string, id: string) {
  const response = await fetch(`/cash/reconciliation-entries/${id}/${action}`, { method: 'POST' });
  if (response.ok) {
    toast.success(`Entry ${action}d successfully`);
    window.location.reload();
  } else {
    toast.error(`Failed to ${action} entry`);
  }
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Reconciliation</h1>
    <p class="text-muted-foreground">Match bank statement entries with journal entries</p>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="flex items-center gap-4 border-b p-4">
      <select
        bind:value={bankAccountId}
        class="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onchange={() => {
          const url = new URL(window.location.href);
          if (bankAccountId) {
            url.searchParams.set('bankAccountId', bankAccountId);
          } else {
            url.searchParams.delete('bankAccountId');
          }
          window.location.href = url.toString();
        }}
      >
        <option value="">All Accounts</option>
        {#each data.accounts as account}
          <option value={account.id}>{account.name}</option>
        {/each}
      </select>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-t bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.entries as entry (entry.id)}
            <tr class="border-t hover:bg-muted/30">
              <td class="px-4 py-3 text-muted-foreground">{formatDate(entry.transactionDate)}</td>
              <td class="px-4 py-3 font-medium">{entry.description}</td>
              <td class="px-4 py-3">
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {entry.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                  {entry.type}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-medium {entry.type === 'credit' ? 'text-green-600' : 'text-red-600'}">
                {entry.type === 'credit' ? '+' : '-'}{formatCurrency(entry.amount)}
              </td>
              <td class="px-4 py-3">
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {reconStatusColor[entry.status] || 'bg-gray-100 text-gray-800'}">
                  {entry.status.replace('_', ' ')}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                {#if entry.status === 'unmatched'}
                  <button onclick={() => handleAction('match', entry.id)} class="mr-2 text-sm text-primary hover:underline">Match</button>
                  <button onclick={() => handleAction('exclude', entry.id)} class="text-sm text-destructive hover:underline">Exclude</button>
                {:else}
                  <span class="text-sm text-muted-foreground">-</span>
                {/if}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
                No reconciliation entries found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
