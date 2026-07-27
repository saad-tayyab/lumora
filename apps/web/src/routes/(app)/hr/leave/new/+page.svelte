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
			goto('/hr/leave');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/hr/leave" class="hover:underline">Leave Requests</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Leave Request</h1>
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
						<div class="flex flex-col gap-2">
							<Label for="leaveTypeId">Leave Type *</Label>
						<Select.Root bind:value={$form.leaveTypeId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select leave type" />
							</Select.Trigger>
							<Select.Content>
								{#each data.leaveTypes as lt}
									<Select.Item value={lt.id}>{lt.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
							{#if $errors.leaveTypeId}<p class="text-xs text-destructive">{$errors.leaveTypeId}</p>{/if}
						</div>
						<Field.Field>
							<Field.FieldLabel for="startDate">Start Date *</Field.FieldLabel>
							<DatePicker bind:value={$form.startDate} />
							{#if $errors.startDate}<Field.FieldError errors={$errors.startDate.map(m => ({ message: m }))} />{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="endDate">End Date *</Field.FieldLabel>
							<DatePicker bind:value={$form.endDate} />
							{#if $errors.endDate}<Field.FieldError errors={$errors.endDate.map(m => ({ message: m }))} />{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="totalDays">Total Days *</Field.FieldLabel>
							<Input id="totalDays" type="number" min="1" bind:value={$form.totalDays} />
							{#if $errors.totalDays}<Field.FieldError errors={$errors.totalDays.map(m => ({ message: m }))} />{/if}
						</Field.Field>
					</div>

					<Field.Field>
						<Field.FieldLabel for="reason">Reason *</Field.FieldLabel>
						<Textarea id="reason" bind:value={$form.reason} rows={3} />
						{#if $errors.reason}<Field.FieldError errors={$errors.reason.map(m => ({ message: m }))} />{/if}
					</Field.Field>

					<Field.Field>
						<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
						<Textarea id="notes" bind:value={$form.notes} rows={2} />
					</Field.Field>

					<div class="flex justify-end gap-3">
						<Button variant="outline" href="/hr/leave">Cancel</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting ? 'Submitting...' : 'Submit Request'}
						</Button>
					</div>
				</Field.FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
