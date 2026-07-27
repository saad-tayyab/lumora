<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

function codeName(codeId: string): string {
  const c = data.codes.find((c: any) => c.id === codeId);
  return c ? c.name : codeId.slice(0, 8);
}

async function handleDelete(id: string) {
  if (!confirm('Delete this rule?')) return;
  deleting = id;
  try {
    const { deleteAutoAssignmentRule } = await import('$lib/api/tax');
    await deleteAutoAssignmentRule(id);
    toast.success('Rule deleted');
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
      <h1 class="text-3xl font-bold text-foreground">Auto-Assignment Rules</h1>
      <p class="text-muted-foreground">{data.total} rules</p>
    </div>
    <Button href="/tax/rules/new">New Rule</Button>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Entity Type</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Tax Code</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Region</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Active</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.rules as rule}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 font-mono">{rule.priority}</td>
              <td class="px-4 py-3 font-medium">{rule.name}</td>
              <td class="px-4 py-3">{rule.entityType}</td>
              <td class="px-4 py-3">{codeName(rule.taxCodeId)}</td>
              <td class="px-4 py-3">{rule.regionCode || '—'}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {rule.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}">
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button onclick={() => handleDelete(rule.id)} disabled={deleting === rule.id} class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button>
              </td>
            </tr>
          {:else}
            <tr><td colspan="7" class="px-4 py-12 text-center text-muted-foreground">No rules found</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content></Card.Root>
</div>
