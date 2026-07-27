<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

function codeName(codeId: string): string {
  const c = data.codes.find((c: any) => c.id === codeId);
  return c ? `${c.name} (${c.code})` : codeId.slice(0, 8);
}

async function handleDelete(id: string) {
  if (!confirm('Delete this tax rate?')) return;
  deleting = id;
  try {
    const { deleteTaxRate } = await import('$lib/api/tax');
    await deleteTaxRate(id);
    toast.success('Tax rate deleted');
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
      <h1 class="text-3xl font-bold text-foreground">Tax Rates</h1>
      <p class="text-muted-foreground">{data.total} rates</p>
    </div>
    <Button href="/tax/rates/new">New Tax Rate</Button>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Tax Code</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Rate</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Effective Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Expiry Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Active</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.rates as rate}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3">{codeName(rate.taxCodeId)}</td>
              <td class="px-4 py-3 text-right font-mono">{(parseFloat(rate.rate) * 100).toFixed(2)}%</td>
              <td class="px-4 py-3">{formatDate(rate.effectiveDate)}</td>
              <td class="px-4 py-3">{rate.expiryDate ? formatDate(rate.expiryDate) : '—'}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {rate.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}">
                  {rate.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button onclick={() => handleDelete(rate.id)} disabled={deleting === rate.id} class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button>
              </td>
            </tr>
          {:else}
            <tr><td colspan="6" class="px-4 py-12 text-center text-muted-foreground">No tax rates found</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content></Card.Root>
</div>
