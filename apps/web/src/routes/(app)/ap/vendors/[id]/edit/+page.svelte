<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Button } from '$lib/components/ui/button';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let name = $state(data.vendor.name);
let email = $state(data.vendor.email || '');
let phone = $state(data.vendor.phone || '');
let address = $state(data.vendor.address || '');
let city = $state(data.vendor.city || '');
let state_ = $state(data.vendor.state || '');
let postalCode = $state(data.vendor.postalCode || '');
let country = $state(data.vendor.country);
let taxId = $state(data.vendor.taxId || '');
let paymentTerms = $state(String(data.vendor.paymentTerms));
let currency = $state(data.vendor.currency);
let notes = $state(data.vendor.notes || '');
let loading = $state(false);
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/ap/vendors" class="hover:underline">Vendors</a>
      <span>/</span>
      <a href="/ap/vendors/{data.vendor.id}" class="hover:underline">{data.vendor.name}</a>
      <span>/</span>
      <span>Edit</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Vendor</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Vendor updated successfully');
          goto('/ap/vendors/{data.vendor.id}');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to update vendor');
        }
      };
    }}
  >
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <Field.FieldGroup>
        <div class="grid gap-4 md:grid-cols-2">
          <Field.Field>
            <Field.FieldLabel for="name">Name *</Field.FieldLabel>
            <Input id="name" name="name" bind:value={name} required />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="email">Email</Field.FieldLabel>
            <Input id="email" name="email" type="email" bind:value={email} />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="phone">Phone</Field.FieldLabel>
            <Input id="phone" name="phone" bind:value={phone} />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="taxId">Tax ID</Field.FieldLabel>
            <Input id="taxId" name="taxId" bind:value={taxId} />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="currency">Currency</Field.FieldLabel>
            <Select.Root bind:value={currency}>
              <Select.Trigger class="w-full">
                <Select.Value placeholder="Select currency" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="USD">USD</Select.Item>
                <Select.Item value="EUR">EUR</Select.Item>
                <Select.Item value="GBP">GBP</Select.Item>
                <Select.Item value="PKR">PKR</Select.Item>
              </Select.Content>
            </Select.Root>
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="paymentTerms">Payment Terms (days)</Field.FieldLabel>
            <Input id="paymentTerms" name="paymentTerms" type="number" bind:value={paymentTerms} />
          </Field.Field>
        </div>

        <Field.Field>
          <Field.FieldLabel for="address">Address</Field.FieldLabel>
          <Input id="address" name="address" bind:value={address} />
        </Field.Field>

        <div class="grid gap-4 md:grid-cols-3">
          <Field.Field>
            <Field.FieldLabel for="city">City</Field.FieldLabel>
            <Input id="city" name="city" bind:value={city} />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="state">State</Field.FieldLabel>
            <Input id="state" name="state" bind:value={state_} />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="postalCode">Postal Code</Field.FieldLabel>
            <Input id="postalCode" name="postalCode" bind:value={postalCode} />
          </Field.Field>
        </div>

        <Field.Field>
          <Field.FieldLabel for="country">Country</Field.FieldLabel>
          <Input id="country" name="country" bind:value={country} />
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="notes">Notes</Field.FieldLabel>
          <Textarea id="notes" name="notes" bind:value={notes} rows={3} />
        </Field.Field>

        <div class="flex justify-end gap-3">
          <Button variant="outline" href="/ap/vendors/{data.vendor.id}">Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Field.FieldGroup>
    </div>
  </form>
</div>
