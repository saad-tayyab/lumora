<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let name = $state(data.budget?.name || '');
let description = $state(data.budget?.description || '');
let status = $state(data.budget?.status || 'draft');

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!data.budget) return;
  submitting = true;
  try {
    const { updateBudget } = await import('$lib/api/budget');
    await updateBudget(data.budget.id, { name, description: description || undefined, status });
    toast.success('Budget updated');
    await goto(`/budgets/${data.budget.id}`);
  } catch (err: any) {
    toast.error(err.message || 'Failed to update');
  } finally {
    submitting = false;
  }
}
</script>

{#if data.budget}
  <div class="mx-auto max-w-2xl flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Edit Budget</h1>
      <p class="text-muted-foreground">{data.budget.name}</p>
    </div>

    <form onsubmit={handleSubmit}>
      <Field.FieldGroup>
        <Field.Field>
          <Field.FieldLabel for="name">Name</Field.FieldLabel>
          <Input id="name" bind:value={name} required />
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="description">Description</Field.FieldLabel>
          <Textarea id="description" bind:value={description} rows="2"></Textarea>
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="status">Status</Field.FieldLabel>
          <Select.Root bind:value={status}>
            <Select.Trigger class="w-full">
              <Select.Value placeholder="Select status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="draft">Draft</Select.Item>
              <Select.Item value="active">Active</Select.Item>
              <Select.Item value="closed">Closed</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field.Field>
      </Field.FieldGroup>

      <div class="flex justify-end gap-3 pt-4">
        <Button variant="outline" href="/budgets/{data.budget.id}">Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  </div>
{:else}
  <div class="flex items-center justify-center py-12"><div class="text-muted-foreground">Budget not found</div></div>
{/if}
