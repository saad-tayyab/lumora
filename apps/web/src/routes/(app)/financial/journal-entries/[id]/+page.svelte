<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const { entry } = data;

const statusBadgeColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  posted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  voided: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const totalDebit = $derived(entry.lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0));
const totalCredit = $derived(entry.lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0));

let posting = $state(false);
let voiding = $state(false);

async function handlePost() {
  posting = true;
  try {
    const res = await fetch(`/journal-entries/${entry.id}/post`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      toast.success('Journal entry posted');
      goto('/financial/journal-entries');
    } else {
      toast.error('Failed to post entry');
    }
  } catch {
    toast.error('Failed to post entry');
  }
  posting = false;
}

async function handleVoid() {
  voiding = true;
  try {
    const res = await fetch(`/journal-entries/${entry.id}/void`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      toast.success('Journal entry voided');
      goto('/financial/journal-entries');
    } else {
      toast.error('Failed to void entry');
    }
  } catch {
    toast.error('Failed to void entry');
  }
  voiding = false;
}
</script>

<div class="mx-auto max-w-3xl space-y-6">
  <div>
    <a href="/financial/journal-entries" class="text-sm text-muted-foreground hover:text-foreground">
      ← Back to Journal Entries
    </a>
    <div class="mt-2 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Journal Entry {entry.entryNumber}</h1>
        <p class="mt-1 text-muted-foreground">{entry.description}</p>
      </div>
      <div class="flex items-center gap-2">
        {#if entry.status === 'draft'}
          <button
            onclick={handlePost}
            disabled={posting}
            class="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {posting ? 'Posting...' : 'Post Entry'}
          </button>
          <button
            onclick={handleVoid}
            disabled={voiding}
            class="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            {voiding ? 'Voiding...' : 'Void Entry'}
          </button>
        {/if}
      </div>
    </div>
  </div>

  <div class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Entry Details</h2>
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
          <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColors[entry.status]}">
            {entry.status}
          </span>
        </dd>
      </div>
      <div>
        <dt class="text-sm text-muted-foreground">Created</dt>
        <dd class="mt-1 text-foreground">{formatDate(entry.createdAt)}</dd>
      </div>
    </dl>
  </div>

  <div class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Lines</h2>
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
  </div>
</div>
