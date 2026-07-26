<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { Account } from '$lib/api/financial';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();

let submitting = $state(false);
let date = $state(form?.date ?? new Date().toISOString().split('T')[0]);
let description = $state(form?.description ?? '');

interface Line {
  accountId: string;
  description: string;
  debit: string;
  credit: string;
}

let lines = $state<Line[]>([
  { accountId: '', description: '', debit: '', credit: '' },
  { accountId: '', description: '', debit: '', credit: '' },
]);

const totalDebit = $derived(lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0));
const totalCredit = $derived(lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0));
const isBalanced = $derived(Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0);

function addLine() {
  lines = [...lines, { accountId: '', description: '', debit: '', credit: '' }];
}

function removeLine(index: number) {
  if (lines.length <= 2) return;
  lines = lines.filter((_, i) => i !== index);
}

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="mx-auto max-w-3xl space-y-6">
  <div>
    <a href="/financial/journal-entries" class="text-sm text-muted-foreground hover:text-foreground">
      ← Back to Journal Entries
    </a>
    <h1 class="mt-2 text-3xl font-bold text-foreground">New Journal Entry</h1>
    <p class="mt-1 text-muted-foreground">Record a double-entry accounting transaction</p>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update();
        submitting = false;
      };
    }}
    class="space-y-6"
  >
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Entry Details</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label for="date" class="text-sm font-medium text-card-foreground">Date *</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            bind:value={date}
            class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div class="space-y-2">
          <label for="description" class="text-sm font-medium text-card-foreground">Description *</label>
          <input
            id="description"
            name="description"
            type="text"
            required
            bind:value={description}
            placeholder="e.g. Record sales revenue"
            class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Lines</h2>
        <button
          type="button"
          onclick={addLine}
          class="rounded-md border px-3 py-1.5 text-xs font-medium text-card-foreground hover:bg-accent"
        >
          + Add Line
        </button>
      </div>

      <input type="hidden" name="lineCount" value={lines.length} />

      <div class="space-y-3">
        {#each lines as line, i}
          <div class="flex items-start gap-2 rounded-md border p-3">
            <div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-12">
              <div class="sm:col-span-4">
                {#if i === 0}
                  <label class="mb-1 block text-xs font-medium text-muted-foreground">Account *</label>
                {/if}
                <select
                  name="line_{i}_accountId"
                  bind:value={line.accountId}
                  required
                  class="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select account...</option>
                  {#each data.accounts as account (account.id)}
                    <option value={account.id}>{account.code} - {account.name}</option>
                  {/each}
                </select>
              </div>
              <div class="sm:col-span-3">
                {#if i === 0}
                  <label class="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
                {/if}
                <input
                  type="text"
                  name="line_{i}_description"
                  bind:value={line.description}
                  placeholder="Line description"
                  class="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div class="sm:col-span-2">
                {#if i === 0}
                  <label class="mb-1 block text-xs font-medium text-muted-foreground">Debit</label>
                {/if}
                <input
                  type="number"
                  name="line_{i}_debit"
                  bind:value={line.debit}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div class="sm:col-span-2">
                {#if i === 0}
                  <label class="mb-1 block text-xs font-medium text-muted-foreground">Credit</label>
                {/if}
                <input
                  type="number"
                  name="line_{i}_credit"
                  bind:value={line.credit}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div class="flex items-end sm:col-span-1">
                {#if i === 0}
                  <div class="mb-1 h-5"></div>
                {/if}
                <button
                  type="button"
                  onclick={() => removeLine(i)}
                  disabled={lines.length <= 2}
                  class="w-full rounded-md border border-destructive/50 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-4 flex items-center justify-end gap-6 border-t pt-4">
        <div class="text-sm">
          <span class="text-muted-foreground">Total Debit: </span>
          <span class="font-medium text-foreground">{totalDebit.toFixed(2)}</span>
        </div>
        <div class="text-sm">
          <span class="text-muted-foreground">Total Credit: </span>
          <span class="font-medium text-foreground">{totalCredit.toFixed(2)}</span>
        </div>
        <div class="text-sm">
          {#if isBalanced}
            <span class="font-medium text-green-600 dark:text-green-400">Balanced</span>
          {:else}
            <span class="font-medium text-red-600 dark:text-red-400">Unbalanced</span>
          {/if}
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3">
      <a
        href="/financial/journal-entries"
        class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        Cancel
      </a>
      <button
        type="submit"
        disabled={submitting || !isBalanced}
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Create Entry'}
      </button>
    </div>
  </form>
</div>
