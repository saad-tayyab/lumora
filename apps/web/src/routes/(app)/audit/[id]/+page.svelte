<script lang="ts">
import { formatDateTime } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

{#if data.entry}
  {@const entry = data.entry}
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Audit Entry</h1>
        <p class="text-muted-foreground">{entry.action} on {entry.resource}</p>
      </div>
      <a href="/audit" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Back to Log</a>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-semibold text-card-foreground">Details</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">ID</dt>
            <dd class="font-mono text-xs">{entry.id}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Timestamp</dt>
            <dd class="font-medium">{formatDateTime(entry.createdAt)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Action</dt>
            <dd class="font-medium">{entry.action}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Resource</dt>
            <dd class="font-medium">{entry.resource}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Resource ID</dt>
            <dd class="font-mono text-xs">{entry.resourceId || '—'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">User ID</dt>
            <dd class="font-mono text-xs">{entry.userId || 'System'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">IP Address</dt>
            <dd>{entry.ipAddress || '—'}</dd>
          </div>
        </dl>
      </div>

      <div class="space-y-6">
        {#if entry.oldValues}
          <div class="rounded-lg border bg-card p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-card-foreground">Old Values</h2>
            <pre class="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">{JSON.stringify(entry.oldValues, null, 2)}</pre>
          </div>
        {/if}

        {#if entry.newValues}
          <div class="rounded-lg border bg-card p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-card-foreground">New Values</h2>
            <pre class="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">{JSON.stringify(entry.newValues, null, 2)}</pre>
          </div>
        {/if}

        {#if entry.metadata}
          <div class="rounded-lg border bg-card p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-card-foreground">Metadata</h2>
            <pre class="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">{JSON.stringify(entry.metadata, null, 2)}</pre>
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center py-12"><div class="text-muted-foreground">Entry not found</div></div>
{/if}
