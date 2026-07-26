<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let vendorId = $state('');
let billId = $state('');
let amount = $state('');
let paymentDate = $state('');
let paymentMethod = $state('bank_transfer');
let reference = $state('');
let bankAccountId = $state('');
let notes = $state('');
let loading = $state(false);

let filteredBills = $state(
  data.bills.filter((b: { vendorId: string }) => !vendorId || b.vendorId === vendorId),
);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/ap/payments" class="hover:underline">Payments</a>
      <span>/</span>
      <span>New Payment</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Record Payment</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Payment recorded successfully');
          goto('/ap/payments');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to record payment');
        }
      };
    }}
    class="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="vendorId" class="text-sm font-medium text-card-foreground">Vendor *</label>
        <select id="vendorId" name="vendorId" bind:value={vendorId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select vendor</option>
          {#each data.vendors as vendor}
            <option value={vendor.id}>{vendor.name}</option>
          {/each}
        </select>
      </div>
      <div class="space-y-2">
        <label for="billId" class="text-sm font-medium text-card-foreground">Bill (optional)</label>
        <select id="billId" name="billId" bind:value={billId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">No bill (credit)</option>
          {#each filteredBills as bill}
            <option value={bill.id}>{bill.billNumber} - {bill.total}</option>
          {/each}
        </select>
      </div>
      <div class="space-y-2">
        <label for="amount" class="text-sm font-medium text-card-foreground">Amount *</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0.01" bind:value={amount} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="paymentDate" class="text-sm font-medium text-card-foreground">Payment Date *</label>
        <input id="paymentDate" name="paymentDate" type="date" bind:value={paymentDate} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="paymentMethod" class="text-sm font-medium text-card-foreground">Payment Method *</label>
        <select id="paymentMethod" name="paymentMethod" bind:value={paymentMethod} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="bank_transfer">Bank Transfer</option>
          <option value="check">Check</option>
          <option value="cash">Cash</option>
          <option value="credit_card">Credit Card</option>
          <option value="online">Online</option>
        </select>
      </div>
      <div class="space-y-2">
        <label for="reference" class="text-sm font-medium text-card-foreground">Reference</label>
        <input id="reference" name="reference" bind:value={reference} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="bankAccountId" class="text-sm font-medium text-card-foreground">Bank Account</label>
        <select id="bankAccountId" name="bankAccountId" bind:value={bankAccountId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select bank account</option>
          {#each data.bankAccounts as account}
            <option value={account.id}>{account.name} ({account.currency})</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="space-y-2">
      <label for="notes" class="text-sm font-medium text-card-foreground">Notes</label>
      <textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <a href="/ap/payments" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
        Cancel
      </a>
      <button type="submit" disabled={loading} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Recording...' : 'Record Payment'}
      </button>
    </div>
  </form>
</div>
