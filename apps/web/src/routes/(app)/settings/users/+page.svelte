<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll, goto } from '$app/navigation';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

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

const columns: ColumnDef<any>[] = [
  { accessorKey: 'name', header: 'Name', cell: (row) => `<a href="/settings/users/${(row as any).original.id}" class="font-medium hover:underline">${(row as any).original.name}</a>` },
  { accessorKey: 'email', header: 'Email', cell: (row) => (row as any).original.email },
  { accessorKey: 'username', header: 'Username', cell: (row) => `<span class="font-mono text-xs">${(row as any).original.username}</span>` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => (row as any).original.status === 'active'
      ? '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">active</span>'
      : '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">suspended</span>',
  },
  { accessorKey: 'mfaEnabled', header: 'MFA', cell: (row) => (row as any).original.mfaEnabled ? 'Yes' : 'No' },
  { accessorKey: 'createdAt', header: 'Created', cell: (row) => formatDate((row as any).original.createdAt) },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<div class="flex items-center justify-end gap-2"><a href="/settings/users/${(row as any).original.id}/edit" class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">Edit</a><button onclick="window.dispatchEvent(new CustomEvent('delete-user', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button></div>`,
  },
];

$effect(() => {
  const handler = (e: Event) => handleDelete((e as CustomEvent).detail);
  window.addEventListener('delete-user', handler);
  return () => window.removeEventListener('delete-user', handler);
});
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Users</h1>
      <p class="text-muted-foreground">{data.total} users</p>
    </div>
    <Button href="/settings/users/new">New User</Button>
  </div>

  <AppDataTable
    {columns}
    data={data.users}
    emptyMessage="No users found"
    pageSize={20}
    totalItems={data.total}
    onRowClick={(row) => goto(`/settings/users/${row.id}`)}
  />
</div>
