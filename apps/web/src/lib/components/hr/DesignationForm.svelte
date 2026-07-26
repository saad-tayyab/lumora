<script lang="ts">
let {
  designation,
  departments,
  errors = {},
}: {
  designation?: { title: string; code: string; departmentId: string; level: number };
  departments: Array<{ id: string; name: string }>;
  errors?: Record<string, string[]>;
} = $props();

let title = $state(designation?.title ?? '');
let code = $state(designation?.code ?? '');
let departmentId = $state(designation?.departmentId ?? '');
let level = $state(designation?.level ?? 1);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="title" class="block text-sm font-medium text-card-foreground">Title *</label>
				<input id="title" name="title" type="text" required bind:value={title} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. Senior Engineer" />
			</div>
			<div>
				<label for="code" class="block text-sm font-medium text-card-foreground">Code *</label>
				<input id="code" name="code" type="text" required maxlength="20" bind:value={code} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. SE" />
			</div>
			<div>
				<label for="departmentId" class="block text-sm font-medium text-card-foreground">Department *</label>
				<select id="departmentId" name="departmentId" required bind:value={departmentId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select department</option>
					{#each departments as dept}
						<option value={dept.id}>{dept.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="level" class="block text-sm font-medium text-card-foreground">Level</label>
				<input id="level" name="level" type="number" min="1" bind:value={level} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{designation ? 'Update Designation' : 'Create Designation'}{/if}
			</button>
			<a href="/hr/designations" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
