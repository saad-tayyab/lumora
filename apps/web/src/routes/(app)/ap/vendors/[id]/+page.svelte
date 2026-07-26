<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/ap/vendors" class="hover:underline">Vendors</a>
        <span>/</span>
        <span>{data.vendor.name}</span>
      </div>
      <h1 class="mt-2 text-3xl font-bold text-foreground">{data.vendor.name}</h1>
    </div>
    <div class="flex gap-2">
      <a
        href="/ap/vendors/{data.vendor.id}/edit"
        class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Edit
      </a>
      <button
        onclick={() => (showDeleteConfirm = true)}
        class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        Delete
      </button>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Contact Information</h2>
      <dl class="space-y-3">
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Email</dt>
          <dd class="text-sm font-medium">{data.vendor.email || '-'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Phone</dt>
          <dd class="text-sm font-medium">{data.vendor.phone || '-'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Address</dt>
          <dd class="text-sm font-medium text-right">{data.vendor.address || '-'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">City</dt>
          <dd class="text-sm font-medium">{data.vendor.city || '-'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">State</dt>
          <dd class="text-sm font-medium">{data.vendor.state || '-'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Country</dt>
          <dd class="text-sm font-medium">{data.vendor.country}</dd>
        </div>
      </dl>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Business Details</h2>
      <dl class="space-y-3">
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Tax ID</dt>
          <dd class="text-sm font-medium">{data.vendor.taxId || '-'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Currency</dt>
          <dd class="text-sm font-medium">{data.vendor.currency}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Payment Terms</dt>
          <dd class="text-sm font-medium">{data.vendor.paymentTerms} days</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Status</dt>
          <dd>
            <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {data.vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
              {data.vendor.status}
            </span>
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Created</dt>
          <dd class="text-sm font-medium">{formatDate(data.vendor.createdAt)}</dd>
        </div>
        {#if data.vendor.notes}
          <div class="pt-2">
            <dt class="text-sm text-muted-foreground">Notes</dt>
            <dd class="mt-1 text-sm">{data.vendor.notes}</dd>
          </div>
        {/if}
      </dl>
    </div>
  </div>
</div>

{#if showDeleteConfirm}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-card-foreground">Delete Vendor</h3>
      <p class="mt-2 text-sm text-muted-foreground">
        Are you sure you want to delete "{data.vendor.name}"? This action cannot be undone.
      </p>
      <div class="mt-4 flex justify-end gap-3">
        <button onclick={() => (showDeleteConfirm = false)} class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
          Cancel
        </button>
        <form
          method="POST"
          action="?/delete"
          use:enhance={() => {
            deleting = true;
            return async ({ result }) => {
              deleting = false;
              if (result.type === 'success') {
                toast.success('Vendor deleted');
                goto('/ap/vendors');
              } else if (result.type === 'failure') {
                toast.error((result.data as Record<string, string>)?.error || 'Failed to delete vendor');
              }
              showDeleteConfirm = false;
            };
          }}
        >
          <button type="submit" disabled={deleting} class="inline-flex items-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}
