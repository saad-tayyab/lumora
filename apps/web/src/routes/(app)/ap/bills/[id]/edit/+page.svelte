<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Button } from '$lib/components/ui/button';
import * as Select from '$lib/components/ui/select';
import type { PageData } from './$types';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data }: { data: PageData } = $props();

let vendorId = $state(data.bill.vendorId);
let billNumber = $state(data.bill.billNumber);
let issueDate = $state(data.bill.issueDate);
let dueDate = $state(data.bill.dueDate);
let subtotal = $state(data.bill.subtotal);
let taxAmount = $state(data.bill.taxAmount);
let total = $state(data.bill.total);
let notes = $state(data.bill.notes || '');
let loading = $state(false);
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/ap/bills" class="hover:underline">Bills</a>
      <span>/</span>
      <a href="/ap/bills/{data.bill.id}" class="hover:underline">{data.bill.billNumber}</a>
      <span>/</span>
      <span>Edit</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Bill</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Bill updated successfully');
          goto('/ap/bills/{data.bill.id}');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to update bill');
        }
      };
    }}
  >
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <Field.FieldGroup>
        <div class="grid gap-4 md:grid-cols-2">
          <Field.Field>
            <Field.FieldLabel for="vendorId">Vendor *</Field.FieldLabel>
            <Select.Root bind:value={vendorId}>
              <Select.Trigger class="w-full">
                <Select.Value placeholder="Select vendor" />
              </Select.Trigger>
              <Select.Content>
                {#each data.vendors as vendor}
                  <Select.Item value={vendor.id}>{vendor.name}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="billNumber">Bill Number *</Field.FieldLabel>
            <Input id="billNumber" name="billNumber" bind:value={billNumber} required />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="issueDate">Issue Date *</Field.FieldLabel>
            <DatePicker bind:value={issueDate} />
            <input type="hidden" name="issueDate" value={issueDate} />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="dueDate">Due Date *</Field.FieldLabel>
            <DatePicker bind:value={dueDate} />
            <input type="hidden" name="dueDate" value={dueDate} />
          </Field.Field>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <Field.Field>
            <Field.FieldLabel for="subtotal">Subtotal</Field.FieldLabel>
            <Input id="subtotal" name="subtotal" bind:value={subtotal} type="number" step="0.01" />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="taxAmount">Tax Amount</Field.FieldLabel>
            <Input id="taxAmount" name="taxAmount" bind:value={taxAmount} type="number" step="0.01" />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="total">Total</Field.FieldLabel>
            <Input id="total" name="total" bind:value={total} type="number" step="0.01" class="font-bold" />
          </Field.Field>
        </div>

        <Field.Field>
          <Field.FieldLabel for="notes">Notes</Field.FieldLabel>
          <Textarea id="notes" name="notes" bind:value={notes} rows={3} />
        </Field.Field>

        <div class="flex justify-end gap-3">
          <Button variant="outline" href="/ap/bills/{data.bill.id}">Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Field.FieldGroup>
    </div>
  </form>
</div>
