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
let name = $state(data.code?.name || '');
let type = $state(data.code?.type || 'sales_tax');
let glAccountId = $state(data.code?.glAccountId || '');
let postingRule = $state(data.code?.postingRule || 'output_liability');
let isClaimable = $state(data.code?.isClaimable ?? false);
let isActive = $state(data.code?.isActive ?? true);
let description = $state(data.code?.description || '');

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!data.code) return;
  submitting = true;
  try {
    const { updateTaxCode } = await import('$lib/api/tax');
    await updateTaxCode(data.code.id, {
      name,
      type,
      glAccountId,
      postingRule,
      isClaimable,
      isActive,
      description: description || undefined,
    });
    toast.success('Tax code updated');
    await goto('/tax/codes');
  } catch (err: any) {
    toast.error(err.message || 'Failed to update');
  } finally {
    submitting = false;
  }
}
</script>

{#if data.code}
  <div class="flex flex-col mx-auto max-w-2xl gap-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Edit Tax Code</h1>
      <p class="text-muted-foreground">{data.code.code}</p>
    </div>

    <form onsubmit={handleSubmit}>
      <Field.FieldGroup>
        <div class="grid gap-4 md:grid-cols-2">
          <Field.Field>
            <Field.FieldLabel for="name">Name</Field.FieldLabel>
            <Input id="name" bind:value={name} required />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="type">Type</Field.FieldLabel>
            <Select.Root bind:value={type}>
              <Select.Trigger class="w-full">
                <Select.Value placeholder="Select type" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="sales_tax">Sales Tax</Select.Item>
                <Select.Item value="vat">VAT</Select.Item>
                <Select.Item value="gst">GST</Select.Item>
                <Select.Item value="excise">Excise</Select.Item>
                <Select.Item value="withholding">Withholding</Select.Item>
              </Select.Content>
            </Select.Root>
          </Field.Field>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <Field.Field>
            <Field.FieldLabel for="glAccount">GL Account ID</Field.FieldLabel>
            <Input id="glAccount" bind:value={glAccountId} required />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="postingRule">Posting Rule</Field.FieldLabel>
            <Select.Root bind:value={postingRule}>
              <Select.Trigger class="w-full">
                <Select.Value placeholder="Select rule" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="output_liability">Output Liability</Select.Item>
                <Select.Item value="input_asset">Input Asset</Select.Item>
                <Select.Item value="expense">Expense</Select.Item>
              </Select.Content>
            </Select.Root>
          </Field.Field>
        </div>

        <Field.Field>
          <Field.FieldLabel for="description">Description</Field.FieldLabel>
          <Textarea id="description" bind:value={description} rows="2"></Textarea>
        </Field.Field>

        <Field.Field>
          <div class="flex gap-6">
            <div class="flex items-center gap-2">
              <Checkbox id="claimable" bind:checked={isClaimable} />
              <Field.FieldLabel for="claimable">Claimable</Field.FieldLabel>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox id="active" bind:checked={isActive} />
              <Field.FieldLabel for="active">Active</Field.FieldLabel>
            </div>
          </div>
        </Field.Field>
      </Field.FieldGroup>

      <div class="flex justify-end gap-3 pt-4">
        <Button variant="outline" href="/tax/codes">Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  </div>
{:else}
  <div class="flex items-center justify-center py-12"><div class="text-muted-foreground">Tax code not found</div></div>
{/if}
