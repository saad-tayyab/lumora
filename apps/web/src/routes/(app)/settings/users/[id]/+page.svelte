<script lang="ts">
import { formatDateTime } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Badge } from '$lib/components/ui/badge';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
</script>

{#if data.user}
  {@const user = data.user}
  <div class="flex flex-col gap-6">
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
      <dl class="mt-4 flex flex-col gap-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Username</dt>
          <dd class="font-mono">{user.username}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Status</dt>
          <dd><Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>{user.status}</Badge></dd>
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
