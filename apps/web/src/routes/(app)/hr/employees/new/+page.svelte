<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import * as Field from '$lib/components/ui/field';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import * as Card from '$lib/components/ui/card';
import * as Select from '$lib/components/ui/select';
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
			goto('/hr/employees');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Add Employee</h1>
		<p class="text-muted-foreground">Create a new employee record</p>
	</div>

	<form method="POST" use:enhance>
		<Field.FieldGroup>
			<Card.Root class="shadow-sm"><Card.Content>
				<Card.Header>
				<Card.Title>Personal Information</Card.Title>
			</Card.Header>
				<div class="grid gap-4 md:grid-cols-2">
					<Field.Field>
						<Field.FieldLabel for="firstName">First Name *</Field.FieldLabel>
						<Input id="firstName" type="text" value={$form.firstName} oninput={(e) => $form.firstName = e.currentTarget.value} />
						{#if $errors.firstName}<Field.FieldError errors={$errors.firstName.map(m => ({ message: m }))} />{/if}
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="lastName">Last Name *</Field.FieldLabel>
						<Input id="lastName" type="text" value={$form.lastName} oninput={(e) => $form.lastName = e.currentTarget.value} />
						{#if $errors.lastName}<Field.FieldError errors={$errors.lastName.map(m => ({ message: m }))} />{/if}
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="email">Email *</Field.FieldLabel>
						<Input id="email" type="email" value={$form.email} oninput={(e) => $form.email = e.currentTarget.value} />
						{#if $errors.email}<Field.FieldError errors={$errors.email.map(m => ({ message: m }))} />{/if}
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="phone">Phone</Field.FieldLabel>
						<Input id="phone" type="tel" value={$form.phone ?? ''} oninput={(e) => $form.phone = e.currentTarget.value} />
					</Field.Field>
				</div>
			</Card.Content></Card.Root>

			<Card.Root class="shadow-sm"><Card.Content>
				<Card.Header>
				<Card.Title>Employment Details</Card.Title>
			</Card.Header>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="flex flex-col gap-1.5">
						<Label for="departmentId">Department</Label>
						<Select.Root bind:value={$form.departmentId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select department" />
							</Select.Trigger>
							<Select.Content>
								{#each data.departments as dept}
									<Select.Item value={dept.id}>{dept.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<div class="flex flex-col gap-1.5">
						<Label for="designationId">Designation</Label>
						<Select.Root bind:value={$form.designationId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select designation" />
							</Select.Trigger>
							<Select.Content>
								{#each data.designations as desig}
									<Select.Item value={desig.id}>{desig.title}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<div class="flex flex-col gap-1.5">
						<Label for="employmentType">Employment Type</Label>
						<Select.Root bind:value={$form.employmentType}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select type" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="full_time">Full Time</Select.Item>
								<Select.Item value="part_time">Part Time</Select.Item>
								<Select.Item value="contract">Contract</Select.Item>
								<Select.Item value="intern">Intern</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<Field.Field>
						<Field.FieldLabel for="dateOfJoining">Joining Date *</Field.FieldLabel>
						<DatePicker bind:value={$form.dateOfJoining} />
						{#if $errors.dateOfJoining}<Field.FieldError errors={$errors.dateOfJoining.map(m => ({ message: m }))} />{/if}
					</Field.Field>
				</div>
			</Card.Content></Card.Root>

			<div class="flex items-center justify-end gap-3">
				<Button variant="outline" href="/hr/employees">Cancel</Button>
				<Button type="submit" disabled={$submitting}>
					{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
					Add Employee
				</Button>
			</div>
		</Field.FieldGroup>
	</form>
</div>
