<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { Button } from '$lib/components/ui/button';
import { Checkbox } from '$lib/components/ui/checkbox';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import * as Card from '$lib/components/ui/card';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/hr/salaries');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl flex flex-col gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/hr/salaries" class="hover:underline">Salaries</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Salary Record</h1>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="flex flex-col gap-2">
							<Label for="employeeId">Employee *</Label>
						<Select.Root bind:value={$form.employeeId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select employee" />
							</Select.Trigger>
							<Select.Content>
								{#each data.employees as emp}
									<Select.Item value={emp.id}>{emp.firstName} {emp.lastName}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
							{#if $errors.employeeId}<p class="text-xs text-destructive">{$errors.employeeId}</p>{/if}
						</div>
						<Field.Field>
							<Field.FieldLabel for="basicSalary">Basic Salary *</Field.FieldLabel>
							<Input id="basicSalary" type="number" step="0.01" min="0" bind:value={$form.basicSalary} />
							{#if $errors.basicSalary}<Field.FieldError errors={$errors.basicSalary.map(m => ({ message: m }))} />{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="allowances">Allowances</Field.FieldLabel>
							<Input id="allowances" type="number" step="0.01" min="0" bind:value={$form.allowances} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="deductions">Deductions</Field.FieldLabel>
							<Input id="deductions" type="number" step="0.01" min="0" bind:value={$form.deductions} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="effectiveFrom">Effective From *</Field.FieldLabel>
							<DatePicker bind:value={$form.effectiveFrom} />
							{#if $errors.effectiveFrom}<Field.FieldError errors={$errors.effectiveFrom.map(m => ({ message: m }))} />{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="effectiveTo">Effective To</Field.FieldLabel>
							<DatePicker bind:value={$form.effectiveTo} />
						</Field.Field>
					</div>

					<Field.Field class="flex flex-row items-center gap-2">
						<Checkbox id="isActive" bind:checked={$form.isActive} />
						<Label for="isActive">Active</Label>
					</Field.Field>

					<div class="flex justify-end gap-3">
						<Button variant="outline" href="/hr/salaries">Cancel</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting ? 'Creating...' : 'Create Salary Record'}
						</Button>
					</div>
				</Field.FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
