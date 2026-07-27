<script lang="ts">
import { Button } from '$lib/components/ui/button';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';

let {
  role,
  errors = {},
}: { role?: { name: string; description: string | null }; errors?: Record<string, string[]> } =
  $props();

let name = $state(role?.name ?? '');
let description = $state(role?.description ?? '');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST">
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="name">Name *</Field.FieldLabel>
				<Input id="name" name="name" required maxlength="50" bind:value={name} />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="description">Description</Field.FieldLabel>
				<Input id="description" name="description" maxlength="255" bind:value={description} />
			</Field.Field>
		</Field.FieldGroup>

		<div class="flex items-center gap-3 pt-4">
			<Button type="submit" disabled={isSubmitting}>
				{#if isSubmitting}Saving...{:else}{role ? 'Update Role' : 'Create Role'}{/if}
			</Button>
			<Button variant="outline" href="/settings/roles">Cancel</Button>
		</div>
	</form>
</div>
