<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';

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
  <div class="mx-auto max-w-2xl space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Edit User</h1>
      <p class="text-muted-foreground">{data.user.username}</p>
    </div>

    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-1.5">
        <label for="name" class="text-sm font-medium text-foreground">Name</label>
        <input id="name" bind:value={name} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="email" class="text-sm font-medium text-foreground">Email</label>
        <input id="email" type="email" bind:value={email} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="username" class="text-sm font-medium text-foreground">Username</label>
        <input id="username" bind:value={username} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="status" class="text-sm font-medium text-foreground">Status</label>
        <select id="status" bind:value={status} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

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
