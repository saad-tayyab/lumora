<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { Button } from '$lib/components/ui/button';
import { Checkbox } from '$lib/components/ui/checkbox';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import * as Card from '$lib/components/ui/card';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: any } = $props();

const { account } = data;

let submitting = $state(false);
let isActive = $state(form?.isActive !== undefined ? form.isActive === 'true' : account.isActive);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
  <div>
    <a href="/financial/accounts/{account.id}" class="text-sm text-muted-foreground hover:text-foreground">
      ← Back to Account
    </a>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Account</h1>
    <p class="mt-1 text-muted-foreground">Update account {account.code}</p>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update();
        submitting = false;
      };
    }}
  >
    <Card.Root>
      <Card.Content>
        <Field.FieldGroup>
          <Field.Field>
            <Field.FieldLabel for="code">Account Code *</Field.FieldLabel>
            <Input
              id="code"
              name="code"
              type="text"
              required
              value={form?.code ?? account.code}
            />
          </Field.Field>

          <Field.Field>
            <Field.FieldLabel for="name">Account Name *</Field.FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={form?.name ?? account.name}
            />
          </Field.Field>

          <Field.Field>
            <Field.FieldLabel for="type">Account Type *</Field.FieldLabel>
            <Select.Root value={form?.type ?? account.type}>
              <Select.Trigger class="w-full">
                <Select.Value placeholder="Select type" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="asset">Asset</Select.Item>
                <Select.Item value="liability">Liability</Select.Item>
                <Select.Item value="equity">Equity</Select.Item>
                <Select.Item value="revenue">Revenue</Select.Item>
                <Select.Item value="expense">Expense</Select.Item>
              </Select.Content>
            </Select.Root>
          </Field.Field>

          <Field.Field>
            <Field.FieldLabel for="description">Description</Field.FieldLabel>
            <Textarea
              id="description"
              name="description"
              rows="3"
              value={form?.description ?? account.description ?? ''}
            ></Textarea>
          </Field.Field>

          <Field.Field class="flex flex-row items-center gap-2">
            <input type="hidden" name="isActive" value={isActive ? 'true' : 'false'} />
            <Checkbox id="isActive" bind:checked={isActive} />
            <Field.FieldLabel for="isActive">Active</Field.FieldLabel>
          </Field.Field>
        </Field.FieldGroup>

        <div class="flex justify-end gap-3 pt-2">
          <Button href="/financial/accounts/{account.id}" variant="outline">Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card.Content>
    </Card.Root>
  </form>
</div>
