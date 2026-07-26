<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

function typeColor(type: string): string {
  const colors: Record<string, string> = {
    sales_tax: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    vat: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    gst: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    excise: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    withholding: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

async function handleDelete(id: string) {
  if (!confirm('Delete this tax code?')) return;
  deleting = id;
  try {
    const { deleteTaxCode } = await import('$lib/api/tax');
    await deleteTaxCode(id);
    toast.success('Tax code deleted');
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
      <h1 class="text-3xl font-bold text-foreground">Tax Codes</h1>
      <p class="text-muted-foreground">{data.total} codes</p>
    </div>
    <a
      href="/tax/codes/new"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Tax Code
    </a>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Posting Rule</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Claimable</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Active</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.codes as code}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 font-mono text-xs">{code.code}</td>
              <td class="px-4 py-3">
                <a href="/tax/codes/{code.id}" class="font-medium hover:underline">{code.name}</a>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {typeColor(code.type)}">
                  {code.type.replace('_', ' ')}
                </span>
              </td>
              <td class="px-4 py-3">{code.postingRule.replace('_', ' ')}</td>
              <td class="px-4 py-3">{code.isClaimable ? 'Yes' : 'No'}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {code.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}">
                  {code.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <a
                    href="/tax/codes/{code.id}"
                    class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Edit
                  </a>
                  <button
                    onclick={() => handleDelete(code.id)}
                    disabled={deleting === code.id}
                    class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-4 py-12 text-center text-muted-foreground">No tax codes found</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
