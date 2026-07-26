<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
</script>

{#if data.budget}
  {@const budget = data.budget}
  <div class="mx-auto max-w-4xl space-y-6">
    <nav class="mb-4 text-sm text-muted-foreground">
      <a href="/budgets" class="hover:underline">Budgets</a>
      <span class="mx-2">/</span>
      <span class="text-foreground">{budget.name}</span>
    </nav>

    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{budget.name}</h1>
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusColor(budget.status)}">{budget.status}</span>
        </div>
        <p class="text-muted-foreground">{formatDate(budget.periodStart)} - {formatDate(budget.periodEnd)}</p>
      </div>
      <div class="flex gap-2">
        <a href="/budgets/{budget.id}/edit" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Edit</a>
        <a href="/budgets" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Back to List</a>
      </div>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-card-foreground">Budget Lines</h2>
      {#if budget.lines.length > 0}
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">Account</th>
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
                <th class="px-4 py-3 text-right font-medium text-muted-foreground">Budget</th>
                <th class="px-4 py-3 text-right font-medium text-muted-foreground">Consumed</th>
                <th class="px-4 py-3 text-right font-medium text-muted-foreground">Variance</th>
              </tr>
            </thead>
            <tbody>
              {#each budget.lines as line}
                <tr class="border-b hover:bg-muted/30">
                  <td class="px-4 py-3 font-mono text-xs">{line.glAccountId.slice(0, 8)}...</td>
                  <td class="px-4 py-3">{line.description || '—'}</td>
                  <td class="px-4 py-3 text-right">{formatCurrency(line.budgetAmount)}</td>
                  <td class="px-4 py-3 text-right">{formatCurrency(line.consumedAmount)}</td>
                  <td class="px-4 py-3 text-right font-medium">
                    <span class={parseFloat(line.varianceAmount) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {formatCurrency(line.varianceAmount)}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="mt-4 text-sm text-muted-foreground">No budget lines yet</p>
      {/if}
    </div>

    {#if data.variance.length > 0}
      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-card-foreground">Variance Analysis</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="px-4 py-3 text-left font-medium text-muted-foreground">Account</th>
                <th class="px-4 py-3 text-right font-medium text-muted-foreground">Budget</th>
                <th class="px-4 py-3 text-right font-medium text-muted-foreground">Consumed</th>
                <th class="px-4 py-3 text-right font-medium text-muted-foreground">Variance</th>
              </tr>
            </thead>
            <tbody>
              {#each data.variance as v}
                <tr class="border-b hover:bg-muted/30">
                  <td class="px-4 py-3 font-mono text-xs">{v.glAccountId.slice(0, 8)}...</td>
                  <td class="px-4 py-3 text-right">{formatCurrency(v.budgetAmount)}</td>
                  <td class="px-4 py-3 text-right">{formatCurrency(v.consumedAmount)}</td>
                  <td class="px-4 py-3 text-right font-medium">
                    <span class={parseFloat(v.varianceAmount) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {formatCurrency(v.varianceAmount)}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex items-center justify-center py-12"><div class="text-muted-foreground">Budget not found</div></div>
{/if}
