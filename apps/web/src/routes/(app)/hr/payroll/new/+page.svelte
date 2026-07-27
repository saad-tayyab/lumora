<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import * as Card from '$lib/components/ui/card';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/hr/payroll');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/hr/payroll" class="hover:underline">Payroll</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Payroll Run</h1>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="period">Period *</Field.FieldLabel>
							<Input id="period" type="month" bind:value={$form.period} />
							{#if $errors.period}<Field.FieldError errors={$errors.period.map(m => ({ message: m }))} />{/if}
						</Field.Field>
						<div class="flex flex-col gap-2">
							<Label for="status">Status</Label>
						<Select.Root bind:value={$form.status}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select status" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="draft">Draft</Select.Item>
								<Select.Item value="processed">Processed</Select.Item>
							</Select.Content>
						</Select.Root>
						</div>
					</div>

					<div class="flex justify-end gap-3">
						<Button variant="outline" href="/hr/payroll">Cancel</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting ? 'Creating...' : 'Create Payroll'}
						</Button>
					</div>
				</Field.FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
