<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { Button } from '$lib/components/ui/button';
import { Label } from '$lib/components/ui/label';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Input } from '$lib/components/ui/input';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

const inputClass = "w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50";

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

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Role</h1>
		<p class="text-muted-foreground">Create a new role</p>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div class="space-y-1.5">
			<Label for="name">Name *</Label>
			<input id="name" type="text" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} class={inputClass} maxlength="50" />
			{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
		</div>
		<div class="space-y-1.5">
			<Label for="description">Description</Label>
			<input id="description" type="text" value={$form.description ?? ''} oninput={(e) => $form.description = e.currentTarget.value} class={inputClass} maxlength="255" />
		</div>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/settings/roles">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
				Create Role
			</Button>
		</div>
	</form>
</div>
