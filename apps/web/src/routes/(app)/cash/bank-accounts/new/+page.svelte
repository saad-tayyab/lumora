<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';

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
  >
    <Card>
      <CardContent class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="name">Account Name *</Label>
            <Input id="name" name="name" bind:value={name} required />
          </div>
          <div class="space-y-2">
            <Label for="bankName">Bank Name *</Label>
            <Input id="bankName" name="bankName" bind:value={bankName} required />
          </div>
          <div class="space-y-2">
            <Label for="accountNumber">Account Number *</Label>
            <Input id="accountNumber" name="accountNumber" bind:value={accountNumber} required />
          </div>
          <div class="space-y-2">
            <Label for="routingNumber">Routing Number</Label>
            <Input id="routingNumber" name="routingNumber" bind:value={routingNumber} />
          </div>
          <div class="space-y-2">
            <Label for="currency">Currency</Label>
            <select id="currency" name="currency" bind:value={currency} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="PKR">PKR</option>
            </select>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <Button href="/cash/bank-accounts" variant="outline">Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </form>
</div>
