<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

async function handleDelete(id: string) {
  if (!confirm('Delete this user?')) return;
  deleting = id;
  try {
    const { deleteUser } = await import('$lib/api/auth');
    await deleteUser(id);
    toast.success('User deleted');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete');
  } finally {
    deleting = null;
  }
}
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Users</h1>
      <p class="text-muted-foreground">{data.total} users</p>
    </div>
    <Button href="/settings/users/new">New User</Button>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Username</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">MFA</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.users as user}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3">
                <a href="/settings/users/{user.id}" class="font-medium hover:underline">{user.name}</a>
              </td>
              <td class="px-4 py-3">{user.email}</td>
              <td class="px-4 py-3 font-mono text-xs">{user.username}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}">
                  {user.status}
                </span>
              </td>
              <td class="px-4 py-3">{user.mfaEnabled ? 'Yes' : 'No'}</td>
              <td class="px-4 py-3">{formatDate(user.createdAt)}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <a href="/settings/users/{user.id}/edit" class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">Edit</a>
                  <button onclick={() => handleDelete(user.id)} disabled={deleting === user.id} class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button>
                </div>
              </td>
            </tr>
          {:else}
            <tr><td colspan="7" class="px-4 py-12 text-center text-muted-foreground">No users found</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content></Card.Root>
</div>
