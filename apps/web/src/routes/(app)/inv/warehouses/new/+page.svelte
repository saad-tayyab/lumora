<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/inv/warehouses');
		}
	}
});
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

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="name">Name *</Label>
						<Input id="name" bind:value={$form.name} />
						{#if $errors.name}<p class="text-xs text-destructive">{$errors.name}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="code">Code *</Label>
						<Input id="code" bind:value={$form.code} />
						{#if $errors.code}<p class="text-xs text-destructive">{$errors.code}</p>{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="address">Address</Label>
					<Input id="address" bind:value={$form.address} />
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="city">City</Label>
						<Input id="city" bind:value={$form.city} />
					</div>
					<div class="space-y-2">
						<Label for="country">Country</Label>
						<Input id="country" bind:value={$form.country} />
					</div>
				</div>

				<div class="flex justify-end gap-3">
					<Button href="/inv/warehouses" variant="outline">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Warehouse'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
