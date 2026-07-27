<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { Input } from '$lib/components/ui/input';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let name = $state(data.user?.name || '');
let email = $state(data.user?.email || '');
let username = $state(data.user?.username || '');
let status = $state(data.user?.status || 'active');

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!data.user) return;
  submitting = true;
  try {
    const { updateUser } = await import('$lib/api/auth');
    await updateUser(data.user.id, { name, email, username, status });
    toast.success('User updated');
    await goto(`/settings/users/${data.user.id}`);
  } catch (err: any) {
    toast.error(err.message || 'Failed to update');
  } finally {
    submitting = false;
  }
}
</script>

{#if data.user}
  <div class="mx-auto max-w-2xl flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Edit User</h1>
      <p class="text-muted-foreground">{data.user.username}</p>
    </div>

    <form onsubmit={handleSubmit}>
      <Field.FieldGroup>
        <Field.Field>
          <Field.FieldLabel for="name">Name</Field.FieldLabel>
          <Input id="name" bind:value={name} required />
        </Field.Field>
        <Field.Field>
          <Field.FieldLabel for="email">Email</Field.FieldLabel>
          <Input id="email" type="email" bind:value={email} required />
        </Field.Field>
        <Field.Field>
          <Field.FieldLabel for="username">Username</Field.FieldLabel>
          <Input id="username" bind:value={username} required />
        </Field.Field>
        <Field.Field>
          <Field.FieldLabel for="status">Status</Field.FieldLabel>
          <Select.Root bind:value={status}>
            <Select.Trigger class="w-full">
              <Select.Value placeholder="Select status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="active">Active</Select.Item>
              <Select.Item value="suspended">Suspended</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field.Field>
      </Field.FieldGroup>

      <div class="flex justify-end gap-3 pt-4">
        <Button variant="outline" href="/settings/users/{data.user.id}">Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  </div>
{:else}
  <div class="flex items-center justify-center py-12"><div class="text-muted-foreground">User not found</div></div>
{/if}
