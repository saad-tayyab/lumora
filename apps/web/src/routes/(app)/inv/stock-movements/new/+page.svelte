<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let itemId = $state('');
let warehouseId = $state('');
let type = $state('in');
let quantity = $state('');
let referenceType = $state('');
let referenceId = $state('');
let notes = $state('');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/inv/stock-movements" class="hover:underline">Stock Movements</a>
      <span>/</span>
      <span>New</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Record Stock Movement</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Stock movement recorded successfully');
          goto('/inv/stock-movements');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to record stock movement');
        }
      };
    }}
  >
    <Card>
      <CardContent class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="itemId">Item *</Label>
            <select id="itemId" name="itemId" bind:value={itemId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select item</option>
              {#each data.items as item}
                <option value={item.id}>{item.name} ({item.sku})</option>
              {/each}
            </select>
          </div>
          <div class="space-y-2">
            <Label for="warehouseId">Warehouse *</Label>
            <select id="warehouseId" name="warehouseId" bind:value={warehouseId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select warehouse</option>
              {#each data.warehouses as warehouse}
                <option value={warehouse.id}>{warehouse.name}</option>
              {/each}
            </select>
          </div>
          <div class="space-y-2">
            <Label for="type">Movement Type *</Label>
            <select id="type" name="type" bind:value={type} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
          <div class="space-y-2">
            <Label for="quantity">Quantity *</Label>
            <Input id="quantity" name="quantity" type="number" min="0.01" step="0.01" bind:value={quantity} required />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="referenceType">Reference Type</Label>
            <Input id="referenceType" name="referenceType" bind:value={referenceType} placeholder="e.g., purchase_order" />
          </div>
          <div class="space-y-2">
            <Label for="referenceId">Reference ID</Label>
            <Input id="referenceId" name="referenceId" bind:value={referenceId} />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <Button href="/inv/stock-movements" variant="outline">Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Recording...' : 'Record Movement'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </form>
</div>
