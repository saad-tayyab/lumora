<script lang="ts">
import type { AccountType } from '$lib/types';
import { formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Badge } from '$lib/components/ui/badge';
import * as Card from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const { account } = data;

function typeBadgeVariant(type: AccountType): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (type) {
    case 'asset': return 'default';
    case 'liability': return 'outline';
    case 'equity': return 'secondary';
    case 'revenue': return 'secondary';
    case 'expense': return 'destructive';
    default: return 'outline';
  }
}
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
  <div>
    <a href="/financial/accounts" class="text-sm text-muted-foreground hover:text-foreground">
      ← Back to Accounts
    </a>
    <div class="mt-2 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">{account.name}</h1>
        <p class="mt-1 text-muted-foreground">Account {account.code}</p>
      </div>
      <Button href="/financial/accounts/{account.id}/edit" variant="outline">Edit</Button>
    </div>
  </div>

  <Card.Root>
    <Card.Content>
      <Card.Header>
				<Card.Title>Account Details</Card.Title>
			</Card.Header>
      <dl class="grid grid-cols-2 gap-4">
        <div>
          <dt class="text-sm text-muted-foreground">Code</dt>
          <dd class="mt-1 font-mono text-foreground">{account.code}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">Name</dt>
          <dd class="mt-1 text-foreground">{account.name}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">Type</dt>
          <dd class="mt-1">
            <Badge variant={typeBadgeVariant(account.type as AccountType)}>
              {account.type}
            </Badge>
          </dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">Status</dt>
          <dd class="mt-1">
            <Badge variant={account.isActive ? 'secondary' : 'outline'}>
              {account.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </dd>
        </div>
        {#if account.description}
          <div class="col-span-2">
            <dt class="text-sm text-muted-foreground">Description</dt>
            <dd class="mt-1 text-foreground">{account.description}</dd>
          </div>
        {/if}
        <div>
          <dt class="text-sm text-muted-foreground">Created</dt>
          <dd class="mt-1 text-foreground">{formatDate(account.createdAt)}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">Updated</dt>
          <dd class="mt-1 text-foreground">{formatDate(account.updatedAt)}</dd>
        </div>
      </dl>
    </Card.Content>
  </Card.Root>
</div>
