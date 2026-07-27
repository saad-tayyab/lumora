<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import * as Field from '$lib/components/ui/field';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Label } from '$lib/components/ui/label';
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
			goto('/hr/attendance');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl flex flex-col gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/hr/attendance" class="hover:underline">Attendance</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Record Attendance</h1>
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
							<Field.FieldLabel for="date">Date *</Field.FieldLabel>
							<DatePicker bind:value={$form.date} />
							{#if $errors.date}<Field.FieldError errors={$errors.date.map(m => ({ message: m }))} />{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="checkIn">Check In</Field.FieldLabel>
							<Input id="checkIn" type="time" bind:value={$form.checkIn} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="checkOut">Check Out</Field.FieldLabel>
							<Input id="checkOut" type="time" bind:value={$form.checkOut} />
						</Field.Field>
						<div class="flex flex-col gap-2">
							<Label for="status">Status *</Label>
						<Select.Root bind:value={$form.status}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select status" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="present">Present</Select.Item>
								<Select.Item value="absent">Absent</Select.Item>
								<Select.Item value="half_day">Half Day</Select.Item>
								<Select.Item value="late">Late</Select.Item>
							</Select.Content>
						</Select.Root>
							{#if $errors.status}<p class="text-xs text-destructive">{$errors.status}</p>{/if}
						</div>
					</div>

					<Field.Field>
						<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
						<Textarea id="notes" bind:value={$form.notes} rows={3} />
					</Field.Field>

					<div class="flex justify-end gap-3">
						<Button variant="outline" href="/hr/attendance">Cancel</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting ? 'Saving...' : 'Record Attendance'}
						</Button>
					</div>
				</Field.FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
