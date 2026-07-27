<script lang="ts">
import { formatDateTime } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
</script>

{#if data.user}
  {@const user = data.user}
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">{user.name}</h1>
        <p class="text-muted-foreground">{user.email}</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" href="/settings/users/{user.id}/edit">Edit</Button>
        <Button variant="outline" href="/settings/users">Back to List</Button>
      </div>
    </div>

    <Card.Root class="shadow-sm"><Card.Content>
      <h2 class="text-lg font-semibold text-card-foreground">User Details</h2>
      <dl class="mt-4 space-y-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Username</dt>
          <dd class="font-mono">{user.username}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Status</dt>
          <dd><span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}">{user.status}</span></dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Email Verified</dt>
          <dd>{user.emailVerified ? 'Yes' : 'No'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">MFA Enabled</dt>
          <dd>{user.mfaEnabled ? 'Yes' : 'No'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Created</dt>
          <dd>{formatDateTime(user.createdAt)}</dd>
        </div>
      </dl>
    </Card.Content></Card.Root>
  </div>
{:else}
  <div class="flex items-center justify-center py-12"><div class="text-muted-foreground">User not found</div></div>
{/if}
