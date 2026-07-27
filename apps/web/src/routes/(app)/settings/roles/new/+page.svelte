<script lang="ts">
import { toast } from 'svelte-sonner';
import { superForm } from 'sveltekit-superforms';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
  if ($message) {
    const text = typeof $message === 'string' ? $message : $message.text;
    if (typeof $message === 'object' && $message.type === 'error') {
      toast.error(text);
    } else {
      toast.success(text);
      goto('/settings/roles');
    }
  }
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Role</h1>
		<p class="text-muted-foreground">Create a new role</p>
	</div>

	<form method="POST" use:enhance>
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="name">Name *</Field.FieldLabel>
				<Input id="name" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} maxlength="50" />
				{#if $errors.name}<Field.FieldError>{$errors.name}</Field.FieldError>{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="description">Description</Field.FieldLabel>
				<Input id="description" value={$form.description ?? ''} oninput={(e) => $form.description = e.currentTarget.value} maxlength="255" />
			</Field.Field>
		</Field.FieldGroup>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/settings/roles">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
				Create Role
			</Button>
		</div>
	</form>
</div>
