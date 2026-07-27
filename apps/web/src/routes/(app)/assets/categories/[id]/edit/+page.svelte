<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Checkbox } from '$lib/components/ui/checkbox';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let name = $state(data.category?.name || '');
let code = $state(data.category?.code || '');
let description = $state(data.category?.description || '');
let defaultDepreciationMethod = $state(data.category?.defaultDepreciationMethod || 'straight_line');
let defaultUsefulLifeMonths = $state(data.category?.defaultUsefulLifeMonths ?? 60);
let defaultSalvageValuePercent = $state(data.category?.defaultSalvageValuePercent || '0');
let isDepreciable = $state(data.category?.isDepreciable ?? true);
let glAccountId = $state(data.category?.glAccountId || '');
let isActive = $state(data.category?.isActive ?? true);

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!data.category) return;
  submitting = true;
  try {
    const { updateAssetCategory } = await import('$lib/api/asset');
    await updateAssetCategory(data.category.id, {
      name,
      description: description || undefined,
      defaultDepreciationMethod,
      defaultUsefulLifeMonths,
      defaultSalvageValuePercent,
      isDepreciable,
      glAccountId: glAccountId || null,
      isActive,
    });
    toast.success('Category updated');
    await goto(`/assets/categories/${data.category.id}`);
  } catch (err: any) {
    toast.error(err.message || 'Failed to update');
  } finally {
    submitting = false;
  }
}
</script>

{#if data.category}
  <div class="flex flex-col mx-auto max-w-2xl gap-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Edit Category</h1>
      <p class="text-muted-foreground">{data.category.code} — {data.category.name}</p>
    </div>

    <form onsubmit={handleSubmit}>
      <Field.FieldGroup>
        <div class="grid gap-4 md:grid-cols-2">
          <Field.Field>
            <Field.FieldLabel for="name">Name *</Field.FieldLabel>
            <Input id="name" bind:value={name} required />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="code">Code *</Field.FieldLabel>
            <Input id="code" bind:value={code} required maxlength="20" />
          </Field.Field>
        </div>

        <Field.Field>
          <Field.FieldLabel for="description">Description</Field.FieldLabel>
          <Textarea id="description" bind:value={description} rows="2"></Textarea>
        </Field.Field>

        <div class="grid gap-4 md:grid-cols-3">
          <Field.Field>
            <Field.FieldLabel for="method">Depreciation Method</Field.FieldLabel>
            <Select.Root bind:value={defaultDepreciationMethod}>
              <Select.Trigger class="w-full">
                <Select.Value placeholder="Select method" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="straight_line">Straight Line</Select.Item>
                <Select.Item value="declining_balance">Declining Balance</Select.Item>
                <Select.Item value="sum_of_years_digits">Sum of Years Digits</Select.Item>
                <Select.Item value="units_of_production">Units of Production</Select.Item>
              </Select.Content>
            </Select.Root>
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="usefulLife">Useful Life (months)</Field.FieldLabel>
            <Input
              id="usefulLife"
              type="number"
              min="1"
              bind:value={defaultUsefulLifeMonths}
            />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="salvage">Salvage Value %</Field.FieldLabel>
            <Input
              id="salvage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              bind:value={defaultSalvageValuePercent}
            />
          </Field.Field>
        </div>

        <Field.Field>
          <Field.FieldLabel for="glAccountId">GL Account ID</Field.FieldLabel>
          <Input id="glAccountId" bind:value={glAccountId} />
        </Field.Field>

        <Field.Field>
          <div class="flex gap-6">
            <div class="flex items-center gap-2">
              <Checkbox id="depreciable" bind:checked={isDepreciable} />
              <Field.FieldLabel for="depreciable">Is Depreciable</Field.FieldLabel>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox id="isActive" bind:checked={isActive} />
              <Field.FieldLabel for="isActive">Is Active</Field.FieldLabel>
            </div>
          </div>
        </Field.Field>
      </Field.FieldGroup>

      <div class="flex justify-end gap-3 pt-4">
        <a
          href="/assets/categories/{data.category.id}"
          class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={submitting}
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
{:else}
  <div class="flex items-center justify-center py-12">
    <div class="text-muted-foreground">Category not found</div>
  </div>
{/if}
