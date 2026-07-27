<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { financialApi } from '$lib/api/financial';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Badge } from '$lib/components/ui/badge';
import { Spinner } from '$lib/components/ui/spinner';
import * as Card from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const { entry } = data;

let loading = $state(false);
let posting = $state(false);
let voiding = $state(false);

function statusBadgeVariants(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'draft': return 'outline';
    case 'posted': return 'secondary';
    case 'voided': return 'destructive';
    default: return 'outline';
  }
}

const totalDebit = $derived(entry.lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0));
const totalCredit = $derived(entry.lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0));

async function handlePost() {
  posting = true;
  try {
    await financialApi.journalEntries.post(entry.id);
    toast.success('Journal entry posted');
    goto('/financial/journal-entries');
  } catch {
    toast.error('Failed to post entry');
  }
  posting = false;
}

async function handleVoid() {
  voiding = true;
  try {
    await financialApi.journalEntries.void(entry.id);
    toast.success('Journal entry voided');
    goto('/financial/journal-entries');
  } catch {
    toast.error('Failed to void entry');
  }
  voiding = false;
}
</script>

<div class="flex flex-col mx-auto max-w-4xl gap-6">
  <nav class="mb-4 text-sm text-muted-foreground">
    <a href="/financial/journal-entries" class="hover:underline">Journal Entries</a>
    <span class="mx-2">/</span>
    <span class="text-foreground">{entry.entryNumber}</span>
  </nav>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <Spinner class="size-8 text-primary" />
    </div>
  {:else}
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Journal Entry {entry.entryNumber}</h1>
        <p class="mt-1 text-muted-foreground">{entry.description}</p>
      </div>
      <div class="flex items-center gap-2">
        {#if entry.status === 'draft'}
          <Button onclick={handlePost} disabled={posting} class="bg-green-600 hover:bg-green-700">
            {posting ? 'Posting...' : 'Post Entry'}
          </Button>
          <Button variant="destructive" onclick={handleVoid} disabled={voiding}>
            {voiding ? 'Voiding...' : 'Void Entry'}
          </Button>
        {/if}
      </div>
    </div>
  </div>

  <Card.Root>
    <Card.Content>
      <Card.Header>
				<Card.Title>Entry Details</Card.Title>
			</Card.Header>
      <dl class="grid grid-cols-2 gap-4">
        <div>
          <dt class="text-sm text-muted-foreground">Entry Number</dt>
          <dd class="mt-1 font-mono text-foreground">{entry.entryNumber}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">Date</dt>
          <dd class="mt-1 text-foreground">{formatDate(entry.date)}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">Status</dt>
          <dd class="mt-1">
            <Badge variant={statusBadgeVariants(entry.status)}>
              {entry.status}
            </Badge>
          </dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">Created</dt>
          <dd class="mt-1 text-foreground">{formatDate(entry.createdAt)}</dd>
        </div>
      </dl>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Content>
      <Card.Header>
				<Card.Title>Lines</Card.Title>
			</Card.Header>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Account</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Debit</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Credit</th>
            </tr>
          </thead>
          <tbody>
            {#each entry.lines as line, i (i)}
              <tr class="border-b last:border-b-0 hover:bg-muted/30">
                <td class="px-4 py-3 text-foreground">
                  <span class="font-mono">{line.accountCode || ''}</span>
                  {#if line.accountName}
                    <span class="ml-1 text-muted-foreground">- {line.accountName}</span>
                  {/if}
                </td>
                <td class="px-4 py-3 text-foreground">{line.description || '—'}</td>
                <td class="px-4 py-3 text-right font-mono text-foreground">
                  {parseFloat(line.debit) > 0 ? formatCurrency(line.debit) : '—'}
                </td>
                <td class="px-4 py-3 text-right font-mono text-foreground">
                  {parseFloat(line.credit) > 0 ? formatCurrency(line.credit) : '—'}
                </td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr class="border-t-2 bg-muted/30 font-medium">
              <td colspan="2" class="px-4 py-3 text-right text-muted-foreground">Totals</td>
              <td class="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(totalDebit)}</td>
              <td class="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-end">
        {#if Math.abs(totalDebit - totalCredit) < 0.001}
          <span class="text-sm font-medium text-green-600 dark:text-green-400">Entry is balanced</span>
        {:else}
          <span class="text-sm font-medium text-red-600 dark:text-red-400">
            Unbalanced by {formatCurrency(Math.abs(totalDebit - totalCredit))}
          </span>
        {/if}
      </div>
    </Card.Content>
  </Card.Root>
  {/if}
</div>
