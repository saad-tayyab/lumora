<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

async function handleDelete(id: string) {
  if (!confirm('Delete this category?')) return;
  deleting = id;
  try {
    const { deleteAssetCategory } = await import('$lib/api/asset');
    await deleteAssetCategory(id);
    toast.success('Category deleted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete');
  } finally {
    deleting = null;
  }
}

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
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Asset Categories</h1>
      <p class="text-muted-foreground">{data.total} categories</p>
    </div>
    <a
      href="/assets/categories/new"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Category
    </a>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Depreciable</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Method</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Useful Life</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Salvage %</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.categories as category}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 font-mono text-xs">{category.code}</td>
              <td class="px-4 py-3 font-medium">{category.name}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                    {category.isDepreciable ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}"
                >
                  {category.isDepreciable ? 'Depreciable' : 'Non-depreciable'}
                </span>
              </td>
              <td class="px-4 py-3">{methodLabel(category.defaultDepreciationMethod)}</td>
              <td class="px-4 py-3">{category.defaultUsefulLifeMonths} mo</td>
              <td class="px-4 py-3">{category.defaultSalvageValuePercent}%</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                    {category.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}"
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <a
                    href="/assets/categories/{category.id}"
                    class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Edit
                  </a>
                  <button
                    onclick={() => handleDelete(category.id)}
                    disabled={deleting === category.id}
                    class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="8" class="px-4 py-12 text-center text-muted-foreground">No categories found</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content></Card.Root>
</div>
