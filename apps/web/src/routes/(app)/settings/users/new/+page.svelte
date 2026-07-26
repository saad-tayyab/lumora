<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

let submitting = $state(false);
let name = $state('');
let email = $state('');
let username = $state('');
let status = $state('active');

async function handleSubmit(e: Event) {
  e.preventDefault();
  submitting = true;
  try {
    const { createUser } = await import('$lib/api/auth');
    await createUser({ name, email, username, status });
    toast.success('User created');
    await goto('/settings/users');
  } catch (err: any) {
    toast.error(err.message || 'Failed to create');
  } finally {
    submitting = false;
  }
}
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New User</h1>
    <p class="text-muted-foreground">Create a new user account</p>
  </div>

  <form onsubmit={handleSubmit} class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
    <div class="space-y-1.5">
      <label for="name" class="text-sm font-medium text-foreground">Name *</label>
      <input id="name" bind:value={name} required maxlength="100" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
    <div class="space-y-1.5">
      <label for="email" class="text-sm font-medium text-foreground">Email *</label>
      <input id="email" type="email" bind:value={email} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
    <div class="space-y-1.5">
      <label for="username" class="text-sm font-medium text-foreground">Username *</label>
      <input id="username" bind:value={username} required maxlength="50" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
    <div class="space-y-1.5">
      <label for="status" class="text-sm font-medium text-foreground">Status</label>
      <select id="status" bind:value={status} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <a href="/settings/users" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Cancel</a>
      <button type="submit" disabled={submitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {submitting ? 'Creating...' : 'Create User'}
      </button>
    </div>
  </form>
</div>
