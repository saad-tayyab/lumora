<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

async function handleDelete(id: string) {
  if (!confirm('Delete this budget?')) return;
  deleting = id;
  try {
    const { deleteBudget } = await import('$lib/api/budget');
    await deleteBudget(id);
    toast.success('Budget deleted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete');
  } finally {
    deleting = null;
  }
}
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Budgets</h1>
      <p class="text-muted-foreground">{data.total} budgets</p>
    </div>
    <Button href="/budgets/new">New Budget</Button>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Period</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Total Amount</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.budgets as budget}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3">
                <a href="/budgets/{budget.id}" class="font-medium hover:underline">{budget.name}</a>
              </td>
              <td class="px-4 py-3">{formatDate(budget.periodStart)} - {formatDate(budget.periodEnd)}</td>
              <td class="px-4 py-3 text-right">{formatCurrency(budget.totalAmount)}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusColor(budget.status)}">
                  {budget.status}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <a href="/budgets/{budget.id}/edit" class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">Edit</a>
                  <button onclick={() => handleDelete(budget.id)} disabled={deleting === budget.id} class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button>
                </div>
              </td>
            </tr>
          {:else}
            <tr><td colspan="5" class="px-4 py-12 text-center text-muted-foreground">No budgets found</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content></Card.Root>
</div>
