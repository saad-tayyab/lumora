<script lang="ts">
let {
  user,
  errors = {},
}: {
  user?: { name: string; email: string; username: string; status: string };
  errors?: Record<string, string[]>;
} = $props();

let name = $state(user?.name ?? '');
let email = $state(user?.email ?? '');
let username = $state(user?.username ?? '');
let status = $state(user?.status ?? 'active');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
				<input id="name" name="name" type="text" required maxlength="100" bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="email" class="block text-sm font-medium text-card-foreground">Email *</label>
				<input id="email" name="email" type="email" required bind:value={email} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="username" class="block text-sm font-medium text-card-foreground">Username *</label>
				<input id="username" name="username" type="text" required maxlength="50" bind:value={username} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="status" class="block text-sm font-medium text-card-foreground">Status</label>
				<select id="status" name="status" bind:value={status} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="active">Active</option>
					<option value="suspended">Suspended</option>
				</select>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{user ? 'Update User' : 'Create User'}{/if}
			</button>
			<a href="/settings/users" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
