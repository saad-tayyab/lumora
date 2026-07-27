<script lang="ts">
import { formatDateTime } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
</script>

{#if data.entry}
  {@const entry = data.entry}
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Audit Entry</h1>
        <p class="text-muted-foreground">{entry.action} on {entry.resource}</p>
      </div>
      <Button variant="outline" href="/audit">Back to Log</Button>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <Card.Root class="shadow-sm"><Card.Content>
        <h2 class="text-lg font-semibold text-card-foreground">Details</h2>
        <dl class="flex flex-col gap-2 text-sm">
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
      </Card.Content></Card.Root>

      <div class="flex flex-col gap-6">
        {#if entry.oldValues}
          <Card.Root class="shadow-sm"><Card.Content>
            <h2 class="text-lg font-semibold text-card-foreground">Old Values</h2>
            <pre class="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">{JSON.stringify(entry.oldValues, null, 2)}</pre>
          </Card.Content></Card.Root>
        {/if}

        {#if entry.newValues}
          <Card.Root class="shadow-sm"><Card.Content>
            <h2 class="text-lg font-semibold text-card-foreground">New Values</h2>
            <pre class="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">{JSON.stringify(entry.newValues, null, 2)}</pre>
          </Card.Content></Card.Root>
        {/if}

        {#if entry.metadata}
          <Card.Root class="shadow-sm"><Card.Content>
            <h2 class="text-lg font-semibold text-card-foreground">Metadata</h2>
            <pre class="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">{JSON.stringify(entry.metadata, null, 2)}</pre>
          </Card.Content></Card.Root>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center py-12"><div class="text-muted-foreground">Entry not found</div></div>
{/if}
