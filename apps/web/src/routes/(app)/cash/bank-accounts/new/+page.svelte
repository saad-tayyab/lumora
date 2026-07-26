<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';

let name = $state('');
let accountNumber = $state('');
let bankName = $state('');
let routingNumber = $state('');
let currency = $state('USD');
let notes = $state('');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/cash/bank-accounts" class="hover:underline">Bank Accounts</a>
      <span>/</span>
      <span>New</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Add Bank Account</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Bank account created successfully');
          goto('/cash/bank-accounts');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to create bank account');
        }
      };
    }}
    class="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="name" class="text-sm font-medium text-card-foreground">Account Name *</label>
        <input id="name" name="name" bind:value={name} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="bankName" class="text-sm font-medium text-card-foreground">Bank Name *</label>
        <input id="bankName" name="bankName" bind:value={bankName} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="accountNumber" class="text-sm font-medium text-card-foreground">Account Number *</label>
        <input id="accountNumber" name="accountNumber" bind:value={accountNumber} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="routingNumber" class="text-sm font-medium text-card-foreground">Routing Number</label>
        <input id="routingNumber" name="routingNumber" bind:value={routingNumber} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="currency" class="text-sm font-medium text-card-foreground">Currency</label>
        <select id="currency" name="currency" bind:value={currency} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="PKR">PKR</option>
        </select>
      </div>
    </div>

    <div class="space-y-2">
      <label for="notes" class="text-sm font-medium text-card-foreground">Notes</label>
      <textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <a href="/cash/bank-accounts" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
        Cancel
      </a>
      <button type="submit" disabled={loading} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Creating...' : 'Create Account'}
      </button>
    </div>
  </form>
</div>
