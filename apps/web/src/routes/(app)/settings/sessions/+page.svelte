<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatDateTime } from '$lib/utils/format';
import type { PageData } from './$types';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let revoking = $state<string | null>(null);

async function handleRevoke(id: string) {
  if (!confirm('Revoke this session?')) return;
  revoking = id;
  try {
    const { invalidateSession } = await import('$lib/api/auth');
    await invalidateSession(id);
    toast.success('Session revoked');
    await invalidateAll();
  } catch (e: any) {
    toast.error(e.message || 'Failed to revoke');
  } finally {
    revoking = null;
  }
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'userId', header: 'User', cell: (row) => `<span class="font-mono text-xs">${(row as any).original.userId.slice(0, 8)}...</span>` },
  { accessorKey: 'ipAddress', header: 'IP Address', cell: (row) => (row as any).original.ipAddress || '—' },
  { accessorKey: 'userAgent', header: 'User Agent', cell: (row) => `<span class="max-w-[200px] truncate text-xs">${(row as any).original.userAgent || '—'}</span>` },
  { accessorKey: 'expiresAt', header: 'Expires', cell: (row) => `<span class="text-xs">${formatDateTime((row as any).original.expiresAt)}</span>` },
  { accessorKey: 'createdAt', header: 'Created', cell: (row) => `<span class="text-xs">${formatDateTime((row as any).original.createdAt)}</span>` },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<button onclick="window.dispatchEvent(new CustomEvent('revoke-session', {detail:'${(row as any).original.id}'}))" class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Revoke</button>`,
  },
];

$effect(() => {
  const handler = (e: Event) => handleRevoke((e as CustomEvent).detail);
  window.addEventListener('revoke-session', handler);
  return () => window.removeEventListener('revoke-session', handler);
});
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Active Sessions</h1>
    <p class="text-muted-foreground">{data.total} sessions</p>
  </div>

  <AppDataTable
    {columns}
    data={data.sessions}
    emptyMessage="No sessions found"
    pageSize={20}
    totalItems={data.total}
  />
</div>
