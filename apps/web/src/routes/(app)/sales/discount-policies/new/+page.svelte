<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { salesApi } from '$lib/api/sales';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let name = $state('');
let type = $state<string>('percentage');
let value = $state('0');
let minQuantity = $state('');
let minAmount = $state('');
let maxDiscountAmount = $state('');
let startDate = $state(new Date().toISOString().split('T')[0]);
let endDate = $state('');
let isActive = $state(true);
let submitting = $state(false);

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!name) {
    toast.error('Policy name is required');
    return;
  }

  submitting = true;
  try {
    await salesApi.discountPolicies.create({
      name,
      type,
      value,
      minQuantity: minQuantity || null,
      minAmount: minAmount || null,
      maxDiscountAmount: maxDiscountAmount || null,
      startDate,
      endDate: endDate || null,
      isActive,
    });
    toast.success('Discount policy created');
    goto('/sales/discount-policies');
  } catch {
    toast.error('Failed to create discount policy');
  } finally {
    submitting = false;
  }
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Discount Policy</h1>
    <p class="text-muted-foreground">Create a new discount policy</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-6">
    <Card.Root class="shadow-sm"><Card.Content>
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Policy Details</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="name" class="mb-1 block text-sm font-medium text-card-foreground">Name *</label>
          <Input id="name" type="text" bind:value={name} placeholder="Policy name" required />
        </div>
        <div>
          <label for="type" class="mb-1 block text-sm font-medium text-card-foreground">Type *</label>
          <select id="type" bind:value={type} class="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
            <option value="tiered">Tiered</option>
          </select>
        </div>
        <div>
          <label for="value" class="mb-1 block text-sm font-medium text-card-foreground">Value *</label>
          <Input id="value" type="number" bind:value={value} min="0" step="0.01" required />
          <p class="mt-1 text-xs text-muted-foreground">
            {type === 'percentage' ? 'Enter as decimal (e.g., 0.10 for 10%)' : 'Enter amount'}
          </p>
        </div>
        <div>
          <label for="minQuantity" class="mb-1 block text-sm font-medium text-card-foreground">Minimum Quantity</label>
          <Input id="minQuantity" type="number" bind:value={minQuantity} min="0" />
        </div>
        <div>
          <label for="minAmount" class="mb-1 block text-sm font-medium text-card-foreground">Minimum Amount</label>
          <Input id="minAmount" type="number" bind:value={minAmount} min="0" step="0.01" />
        </div>
        <div>
          <label for="maxDiscountAmount" class="mb-1 block text-sm font-medium text-card-foreground">Max Discount Amount</label>
          <Input id="maxDiscountAmount" type="number" bind:value={maxDiscountAmount} min="0" step="0.01" />
        </div>
        <div>
          <label for="startDate" class="mb-1 block text-sm font-medium text-card-foreground">Start Date *</label>
          <DatePicker bind:value={startDate} />
        </div>
        <div>
          <label for="endDate" class="mb-1 block text-sm font-medium text-card-foreground">End Date</label>
          <DatePicker bind:value={endDate} />
        </div>
        <div class="flex items-center gap-2">
          <input id="isActive" type="checkbox" bind:checked={isActive} class="h-4 w-4 rounded border" />
          <label for="isActive" class="text-sm font-medium text-card-foreground">Active</label>
        </div>
      </div>
    </Card.Content></Card.Root>

    <div class="flex items-center justify-end gap-3">
      <Button variant="outline" href="/sales/discount-policies">Cancel</Button>
      <Button type="submit" disabled={submitting}>
        {#if submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
        Create Discount Policy
      </Button>
    </div>
  </form>
</div>
