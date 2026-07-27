<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

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

const columns: ColumnDef<any>[] = [
  { accessorKey: 'name', header: 'Name', cell: (row) => `<span class="font-medium">${(row as any).original.name}</span>` },
  { accessorKey: 'description', header: 'Description', cell: (row) => `<span class="text-muted-foreground">${(row as any).original.description || '—'}</span>` },
  { accessorKey: 'isSystem', header: 'System', cell: (row) => (row as any).original.isSystem ? 'Yes' : 'No' },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => {
      if ((row as any).original.isSystem) return '';
      return `<button onclick="window.dispatchEvent(new CustomEvent('delete-role', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button>`;
    },
  },
];

$effect(() => {
  const handler = (e: Event) => handleDelete((e as CustomEvent).detail);
  window.addEventListener('delete-role', handler);
  return () => window.removeEventListener('delete-role', handler);
});
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Roles</h1>
      <p class="text-muted-foreground">{data.total} roles</p>
    </div>
    <Button href="/settings/roles/new">New Role</Button>
  </div>

  <AppDataTable
    {columns}
    data={data.roles}
    emptyMessage="No roles found"
    pageSize={20}
    totalItems={data.total}
  />
</div>
