<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';

let name = $state('');
let code = $state('');
let address = $state('');
let city = $state('');
let country = $state('');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/inv/warehouses" class="hover:underline">Warehouses</a>
      <span>/</span>
      <span>New</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Add Warehouse</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Warehouse created successfully');
          goto('/inv/warehouses');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to create warehouse');
        }
      };
    }}
    class="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="name" class="text-sm font-medium text-card-foreground">Name *</label>
        <input id="name" name="name" bind:value={name} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="code" class="text-sm font-medium text-card-foreground">Code *</label>
        <input id="code" name="code" bind:value={code} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="space-y-2">
      <label for="address" class="text-sm font-medium text-card-foreground">Address</label>
      <input id="address" name="address" bind:value={address} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="city" class="text-sm font-medium text-card-foreground">City</label>
        <input id="city" name="city" bind:value={city} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="country" class="text-sm font-medium text-card-foreground">Country</label>
        <input id="country" name="country" bind:value={country} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="flex justify-end gap-3">
      <a href="/inv/warehouses" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
        Cancel
      </a>
      <button type="submit" disabled={loading} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Creating...' : 'Create Warehouse'}
      </button>
    </div>
  </form>
</div>
