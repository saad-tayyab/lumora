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
let name = $state(data.asset?.name || '');
let description = $state(data.asset?.description || '');
let categoryId = $state(data.asset?.categoryId || '');
let isDepreciable = $state(data.asset?.isDepreciable ?? true);

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!data.asset) return;
  submitting = true;
  try {
    const { updateFixedAsset } = await import('$lib/api/asset');
    await updateFixedAsset(data.asset.id, {
      name,
      description: description || undefined,
      categoryId,
      isDepreciable,
    });
    toast.success('Asset updated');
    await goto(`/assets/fixed-assets/${data.asset.id}`);
  } catch (err: any) {
    toast.error(err.message || 'Failed to update');
  } finally {
    submitting = false;
  }
}
</script>

{#if data.asset}
  <div class="flex flex-col mx-auto max-w-2xl gap-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Edit Fixed Asset</h1>
      <p class="text-muted-foreground">{data.asset.assetNumber}</p>
    </div>

    <form onsubmit={handleSubmit}>
      <Field.FieldGroup>
        <Field.Field>
          <Field.FieldLabel for="name">Name *</Field.FieldLabel>
          <Input id="name" bind:value={name} required />
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="description">Description</Field.FieldLabel>
          <Textarea id="description" bind:value={description} rows="2"></Textarea>
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="category">Category *</Field.FieldLabel>
          <Select.Root bind:value={categoryId}>
            <Select.Trigger class="w-full">
              <Select.Value placeholder="Select category" />
            </Select.Trigger>
            <Select.Content>
              {#each data.categories as cat}
                <Select.Item value={cat.id}>{cat.name} ({cat.code})</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </Field.Field>

        <Field.Field class="flex flex-row items-center gap-2">
          <Checkbox id="depreciable" bind:checked={isDepreciable} />
          <Field.FieldLabel for="depreciable">Is Depreciable</Field.FieldLabel>
        </Field.Field>
      </Field.FieldGroup>

      <div class="flex justify-end gap-3 pt-4">
        <a
          href="/assets/fixed-assets/{data.asset.id}"
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
    <div class="text-muted-foreground">Asset not found</div>
  </div>
{/if}
