<script lang="ts">
import type { AccountType } from '$lib/types';
import { formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const { account } = data;

const typeBadgeColors: Record<AccountType, string> = {
  asset: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  liability: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  equity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  revenue: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  expense: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};
</script>

<div class="mx-auto max-w-2xl space-y-6">
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

  <Card>
    <CardContent>
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Account Details</h2>
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
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {typeBadgeColors[account.type as AccountType]}">
              {account.type}
            </span>
          </dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">Status</dt>
          <dd class="mt-1">
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {account.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}">
              {account.isActive ? 'Active' : 'Inactive'}
            </span>
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
    </CardContent>
  </Card>
</div>
