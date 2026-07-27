<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';
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
  >
    <Card>
      <CardContent class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="fromAccountId">From Account *</Label>
            <select id="fromAccountId" name="fromAccountId" bind:value={fromAccountId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select source account</option>
              {#each data.accounts as account}
                <option value={account.id}>{account.name} ({account.currency})</option>
              {/each}
            </select>
          </div>
          <div class="space-y-2">
            <Label for="toAccountId">To Account *</Label>
            <select id="toAccountId" name="toAccountId" bind:value={toAccountId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select destination account</option>
              {#each data.accounts as account}
                <option value={account.id}>{account.name} ({account.currency})</option>
              {/each}
            </select>
          </div>
          <div class="space-y-2">
            <Label for="amount">Amount *</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01" bind:value={amount} required />
          </div>
          <div class="space-y-2">
            <Label for="transferDate">Transfer Date *</Label>
            <DatePicker bind:value={transferDate} />
            <input type="hidden" name="transferDate" value={transferDate} />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="reference">Reference</Label>
          <Input id="reference" name="reference" bind:value={reference} />
        </div>

        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <Button href="/cash/transfers" variant="outline">Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Transfer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </form>
</div>
