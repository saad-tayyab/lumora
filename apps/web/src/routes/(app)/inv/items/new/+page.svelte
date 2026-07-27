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

let name = $state('');
let sku = $state('');
let description = $state('');
let categoryId = $state('');
let unitOfMeasure = $state('pcs');
let costPrice = $state('');
let salePrice = $state('');
let reorderPoint = $state('');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/inv/items" class="hover:underline">Items</a>
      <span>/</span>
      <span>New</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Add Item</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Item created successfully');
          goto('/inv/items');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to create item');
        }
      };
    }}
  >
    <Card>
      <CardContent class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="name">Name *</Label>
            <Input id="name" name="name" bind:value={name} required />
          </div>
          <div class="space-y-2">
            <Label for="sku">SKU *</Label>
            <Input id="sku" name="sku" bind:value={sku} required />
          </div>
          <div class="space-y-2">
            <Label for="categoryId">Category</Label>
            <select id="categoryId" name="categoryId" bind:value={categoryId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select category</option>
              {#each data.categories as category}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>
          </div>
          <div class="space-y-2">
            <Label for="unitOfMeasure">Unit of Measure *</Label>
            <select id="unitOfMeasure" name="unitOfMeasure" bind:value={unitOfMeasure} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="pcs">Pieces</option>
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
              <option value="l">Liters</option>
              <option value="ml">Milliliters</option>
              <option value="m">Meters</option>
              <option value="box">Box</option>
              <option value="set">Set</option>
            </select>
          </div>
          <div class="space-y-2">
            <Label for="costPrice">Cost Price *</Label>
            <Input id="costPrice" name="costPrice" type="number" step="0.01" min="0" bind:value={costPrice} required />
          </div>
          <div class="space-y-2">
            <Label for="salePrice">Sale Price *</Label>
            <Input id="salePrice" name="salePrice" type="number" step="0.01" min="0" bind:value={salePrice} required />
          </div>
          <div class="space-y-2">
            <Label for="reorderPoint">Reorder Point</Label>
            <Input id="reorderPoint" name="reorderPoint" type="number" step="0.01" min="0" bind:value={reorderPoint} />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <textarea id="description" name="description" bind:value={description} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <Button href="/inv/items" variant="outline">Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Item'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </form>
</div>
