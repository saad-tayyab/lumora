<script lang="ts">
import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';
import { formatDateTime } from '$lib/utils/format';
import type { PageData } from './$types';

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
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Active Sessions</h1>
    <p class="text-muted-foreground">{data.total} sessions</p>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">IP Address</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">User Agent</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Expires</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.sessions as session}
            <tr class="border-b hover:bg-muted/30">
              <td class="px-4 py-3 font-mono text-xs">{session.userId.slice(0, 8)}...</td>
              <td class="px-4 py-3">{session.ipAddress || '—'}</td>
              <td class="px-4 py-3 max-w-[200px] truncate text-xs">{session.userAgent || '—'}</td>
              <td class="px-4 py-3 text-xs">{formatDateTime(session.expiresAt)}</td>
              <td class="px-4 py-3 text-xs">{formatDateTime(session.createdAt)}</td>
              <td class="px-4 py-3 text-right">
                <button onclick={() => handleRevoke(session.id)} disabled={revoking === session.id} class="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50">Revoke</button>
              </td>
            </tr>
          {:else}
            <tr><td colspan="6" class="px-4 py-12 text-center text-muted-foreground">No sessions found</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
