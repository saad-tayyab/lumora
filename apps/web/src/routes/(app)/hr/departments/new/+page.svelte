<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import * as Field from '$lib/components/ui/field';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { Input } from '$lib/components/ui/input';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/hr/departments');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Department</h1>
		<p class="text-muted-foreground">Create a new department</p>
	</div>

	<form method="POST" use:enhance>
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="name">Name *</Field.FieldLabel>
				<Input id="name" type="text" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} placeholder="e.g. Engineering" />
				{#if $errors.name}<Field.FieldError errors={$errors.name.map(m => ({ message: m }))} />{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="description">Description</Field.FieldLabel>
				<Input id="description" type="text" value={$form.description ?? ''} oninput={(e) => $form.description = e.currentTarget.value} />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="managerId">Manager ID</Field.FieldLabel>
				<Input id="managerId" type="text" value={$form.managerId ?? ''} oninput={(e) => $form.managerId = e.currentTarget.value} />
			</Field.Field>

			<div class="flex justify-end gap-3 pt-4">
				<Button variant="outline" href="/hr/departments">Cancel</Button>
				<Button type="submit" disabled={$submitting}>
					{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
					Create Department
				</Button>
			</div>
		</Field.FieldGroup>
	</form>
</div>
