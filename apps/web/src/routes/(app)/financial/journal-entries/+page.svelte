<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const statusBadgeColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  posted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  voided: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

let search = $state('');
let filterStatus = $state('');

const filteredEntries = $derived(
  data.entries.filter((entry) => {
    const matchesSearch =
      !search ||
      entry.entryNumber.toLowerCase().includes(search.toLowerCase()) ||
      entry.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  }),
);
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Journal Entries</h1>
      <p class="mt-1 text-muted-foreground">Record and manage double-entry transactions</p>
    </div>
    <Button href="/financial/journal-entries/new">New Entry</Button>
  </div>

  <div class="flex gap-3">
    <Input
      type="text"
      placeholder="Search by number or description..."
      bind:value={search}
      class="flex-1"
    />
    <select
      bind:value={filterStatus}
      class="rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">All Statuses</option>
      <option value="draft">Draft</option>
      <option value="posted">Posted</option>
      <option value="voided">Voided</option>
    </select>
  </div>

  <Card>
    <CardContent>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Entry #</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if filteredEntries.length === 0}
              <tr>
                <td colspan="5" class="px-4 py-8 text-center text-muted-foreground">
                  No journal entries found
                </td>
              </tr>
            {:else}
              {#each filteredEntries as entry (entry.id)}
                <tr class="border-b last:border-b-0 hover:bg-muted/30">
                  <td class="px-4 py-3 font-mono text-foreground">{entry.entryNumber}</td>
                  <td class="px-4 py-3 text-foreground">{formatDate(entry.date)}</td>
                  <td class="px-4 py-3 text-foreground">{entry.description}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColors[entry.status]}">
                      {entry.status}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <a
                      href="/financial/journal-entries/{entry.id}"
                      class="text-primary hover:underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>

  <div class="text-sm text-muted-foreground">
    Showing {filteredEntries.length} of {data.entries.length} entries
  </div>
</div>
