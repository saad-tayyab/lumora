<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';

let name = $state('');
let email = $state('');
let phone = $state('');
let address = $state('');
let city = $state('');
let state_ = $state('');
let postalCode = $state('');
let country = $state('US');
let taxId = $state('');
let paymentTerms = $state('30');
let currency = $state('USD');
let notes = $state('');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Add Vendor</h1>
    <p class="text-muted-foreground">Create a new vendor record</p>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Vendor created successfully');
          goto('/ap/vendors');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to create vendor');
        }
      };
    }}
    class="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="name" class="text-sm font-medium text-card-foreground">Name *</label>
        <input id="name" name="name" bind:value={name} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="email" class="text-sm font-medium text-card-foreground">Email</label>
        <input id="email" name="email" type="email" bind:value={email} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="phone" class="text-sm font-medium text-card-foreground">Phone</label>
        <input id="phone" name="phone" bind:value={phone} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="taxId" class="text-sm font-medium text-card-foreground">Tax ID</label>
        <input id="taxId" name="taxId" bind:value={taxId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
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
      <div class="space-y-2">
        <label for="paymentTerms" class="text-sm font-medium text-card-foreground">Payment Terms (days)</label>
        <input id="paymentTerms" name="paymentTerms" type="number" bind:value={paymentTerms} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="space-y-2">
      <label for="address" class="text-sm font-medium text-card-foreground">Address</label>
      <input id="address" name="address" bind:value={address} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="space-y-2">
        <label for="city" class="text-sm font-medium text-card-foreground">City</label>
        <input id="city" name="city" bind:value={city} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="state" class="text-sm font-medium text-card-foreground">State</label>
        <input id="state" name="state" bind:value={state_} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="postalCode" class="text-sm font-medium text-card-foreground">Postal Code</label>
        <input id="postalCode" name="postalCode" bind:value={postalCode} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="space-y-2">
      <label for="country" class="text-sm font-medium text-card-foreground">Country</label>
      <input id="country" name="country" bind:value={country} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <div class="space-y-2">
      <label for="notes" class="text-sm font-medium text-card-foreground">Notes</label>
      <textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <a href="/ap/vendors" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
        Cancel
      </a>
      <button type="submit" disabled={loading} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Creating...' : 'Create Vendor'}
      </button>
    </div>
  </form>
</div>
