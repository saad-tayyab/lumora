<script lang="ts">
import { formatDateTime } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data }: { data: PageData } = $props();
let userId = $state('');
let resource = $state('');
let action = $state('');
let startDate = $state('');
let endDate = $state('');

function actionColor(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('create') || a.includes('insert'))
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  if (a.includes('update') || a.includes('edit'))
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  if (a.includes('delete') || a.includes('remove'))
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Audit Log</h1>
    <p class="text-muted-foreground">{data.total} entries</p>
  </div>

  <form method="get">
    <div class="grid gap-4 md:grid-cols-5">
      <div class="space-y-1.5">
        <label for="userId" class="text-sm font-medium text-foreground">User ID</label>
        <input id="userId" name="userId" bind:value={userId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="resource" class="text-sm font-medium text-foreground">Resource</label>
        <input id="resource" name="resource" bind:value={resource} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="action" class="text-sm font-medium text-foreground">Action</label>
        <input id="action" name="action" bind:value={action} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="startDate" class="text-sm font-medium text-foreground">Start Date</label>
        <DatePicker bind:value={startDate} />
        <input type="hidden" name="startDate" value={startDate} />
      </div>
      <div class="space-y-1.5">
        <label for="endDate" class="text-sm font-medium text-foreground">End Date</label>
        <DatePicker bind:value={endDate} />
        <input type="hidden" name="endDate" value={endDate} />
      </div>
    </div>
    <div class="mt-4 flex justify-end">
      <Button type="submit">Filter</Button>
    </div>
  </form>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Resource</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Resource ID</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.entries as entry}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 text-xs">{formatDateTime(entry.createdAt)}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {actionColor(entry.action)}">{entry.action}</span>
              </td>
              <td class="px-4 py-3">{entry.resource}</td>
              <td class="px-4 py-3 font-mono text-xs">{entry.resourceId ? entry.resourceId.slice(0, 8) + '...' : '—'}</td>
              <td class="px-4 py-3 font-mono text-xs">{entry.userId ? entry.userId.slice(0, 8) + '...' : 'System'}</td>
              <td class="px-4 py-3 text-right">
                <a href="/audit/{entry.id}" class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">View</a>
              </td>
            </tr>
          {:else}
            <tr><td colspan="6" class="px-4 py-12 text-center text-muted-foreground">No audit entries found</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content></Card.Root>
</div>
