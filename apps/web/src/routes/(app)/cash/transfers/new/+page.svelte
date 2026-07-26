<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let fromAccountId = $state('');
let toAccountId = $state('');
let amount = $state('');
let transferDate = $state('');
let reference = $state('');
let notes = $state('');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/cash/transfers" class="hover:underline">Transfers</a>
      <span>/</span>
      <span>New Transfer</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">New Transfer</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Transfer created successfully');
          goto('/cash/transfers');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to create transfer');
        }
      };
    }}
    class="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="fromAccountId" class="text-sm font-medium text-card-foreground">From Account *</label>
        <select id="fromAccountId" name="fromAccountId" bind:value={fromAccountId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select source account</option>
          {#each data.accounts as account}
            <option value={account.id}>{account.name} ({account.currency})</option>
          {/each}
        </select>
      </div>
      <div class="space-y-2">
        <label for="toAccountId" class="text-sm font-medium text-card-foreground">To Account *</label>
        <select id="toAccountId" name="toAccountId" bind:value={toAccountId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select destination account</option>
          {#each data.accounts as account}
            <option value={account.id}>{account.name} ({account.currency})</option>
          {/each}
        </select>
      </div>
      <div class="space-y-2">
        <label for="amount" class="text-sm font-medium text-card-foreground">Amount *</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0.01" bind:value={amount} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="transferDate" class="text-sm font-medium text-card-foreground">Transfer Date *</label>
        <input id="transferDate" name="transferDate" type="date" bind:value={transferDate} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="space-y-2">
      <label for="reference" class="text-sm font-medium text-card-foreground">Reference</label>
      <input id="reference" name="reference" bind:value={reference} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <div class="space-y-2">
      <label for="notes" class="text-sm font-medium text-card-foreground">Notes</label>
      <textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <a href="/cash/transfers" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
        Cancel
      </a>
      <button type="submit" disabled={loading} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Creating...' : 'Create Transfer'}
      </button>
    </div>
  </form>
</div>
