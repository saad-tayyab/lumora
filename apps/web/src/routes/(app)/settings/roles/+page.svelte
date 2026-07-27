<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let deleting = $state<string | null>(null);

async function handleDelete(id: string) {
  if (!confirm('Delete this role?')) return;
  deleting = id;
  try {
    const { deleteRole } = await import('$lib/api/auth');
    await deleteRole(id);
    toast.success('Role deleted');
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
      <h1 class="text-3xl font-bold text-foreground">Roles</h1>
      <p class="text-muted-foreground">{data.total} roles</p>
    </div>
    <Button href="/settings/roles/new">New Role</Button>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">System</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.roles as role}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 font-medium">{role.name}</td>
              <td class="px-4 py-3 text-muted-foreground">{role.description || '—'}</td>
              <td class="px-4 py-3">{role.isSystem ? 'Yes' : 'No'}</td>
              <td class="px-4 py-3 text-right">
                {#if !role.isSystem}
                  <button onclick={() => handleDelete(role.id)} disabled={deleting === role.id} class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button>
                {/if}
              </td>
            </tr>
          {:else}
            <tr><td colspan="4" class="px-4 py-12 text-center text-muted-foreground">No roles found</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content></Card.Root>
</div>
