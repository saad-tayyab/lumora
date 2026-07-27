<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Card from '$lib/components/ui/card';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let name = $state(data.item.name);
let sku = $state(data.item.sku);
let description = $state(data.item.description || '');
let categoryId = $state(data.item.categoryId || '');
let unitOfMeasure = $state(data.item.unitOfMeasure);
let costPrice = $state(data.item.costPrice);
let salePrice = $state(data.item.salePrice);
let reorderPoint = $state(data.item.reorderPoint || '');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl flex flex-col gap-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/inv/items" class="hover:underline">Items</a>
      <span>/</span>
      <a href="/inv/items/{data.item.id}" class="hover:underline">{data.item.name}</a>
      <span>/</span>
      <span>Edit</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Item</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Item updated successfully');
          goto('/inv/items/{data.item.id}');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to update item');
        }
      };
    }}
  >
    <Card.Root>
      <Card.Content>
        <Field.FieldGroup>
          <div class="grid gap-4 md:grid-cols-2">
            <Field.Field>
              <Field.FieldLabel for="name">Name *</Field.FieldLabel>
              <Input id="name" name="name" bind:value={name} required />
            </Field.Field>
            <Field.Field>
              <Field.FieldLabel for="sku">SKU *</Field.FieldLabel>
              <Input id="sku" name="sku" bind:value={sku} required />
            </Field.Field>
            <Field.Field>
              <Field.FieldLabel for="categoryId">Category</Field.FieldLabel>
              <Select.Root bind:value={categoryId}>
                <Select.Trigger class="w-full">
                  <Select.Value placeholder="Select category" />
                </Select.Trigger>
                <Select.Content>
                  {#each data.categories as category}
                    <Select.Item value={category.id}>{category.name}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            </Field.Field>
            <Field.Field>
              <Field.FieldLabel for="unitOfMeasure">Unit of Measure *</Field.FieldLabel>
              <Select.Root bind:value={unitOfMeasure}>
                <Select.Trigger class="w-full">
                  <Select.Value placeholder="Select unit" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="pcs">Pieces</Select.Item>
                  <Select.Item value="kg">Kilograms</Select.Item>
                  <Select.Item value="g">Grams</Select.Item>
                  <Select.Item value="l">Liters</Select.Item>
                  <Select.Item value="ml">Milliliters</Select.Item>
                  <Select.Item value="m">Meters</Select.Item>
                  <Select.Item value="box">Box</Select.Item>
                  <Select.Item value="set">Set</Select.Item>
                </Select.Content>
              </Select.Root>
            </Field.Field>
            <Field.Field>
              <Field.FieldLabel for="costPrice">Cost Price *</Field.FieldLabel>
              <Input id="costPrice" name="costPrice" type="number" step="0.01" min="0" bind:value={costPrice} required />
            </Field.Field>
            <Field.Field>
              <Field.FieldLabel for="salePrice">Sale Price *</Field.FieldLabel>
              <Input id="salePrice" name="salePrice" type="number" step="0.01" min="0" bind:value={salePrice} required />
            </Field.Field>
            <Field.Field>
              <Field.FieldLabel for="reorderPoint">Reorder Point</Field.FieldLabel>
              <Input id="reorderPoint" name="reorderPoint" type="number" step="0.01" min="0" bind:value={reorderPoint} />
            </Field.Field>
          </div>

          <Field.Field>
            <Field.FieldLabel for="description">Description</Field.FieldLabel>
            <Textarea id="description" name="description" bind:value={description} rows="3" />
          </Field.Field>

          <div class="flex justify-end gap-3">
            <Button href="/inv/items/{data.item.id}" variant="outline">Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Field.FieldGroup>
      </Card.Content>
    </Card.Root>
  </form>
</div>
