<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import DatePicker from '$lib/components/ui/date-picker.svelte';
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
			goto('/proc/receiving-reports');
		}
	}
});
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Receiving Report</h1>
		<p class="text-muted-foreground">Record incoming shipment</p>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<h2 class="text-lg font-semibold text-card-foreground">Receiving Details</h2>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="purchaseOrderId">Purchase Order *</Field.FieldLabel>
						<Select.Root bind:value={$form.purchaseOrderId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select purchase order" />
							</Select.Trigger>
							<Select.Content>
								{#each data.purchaseOrders as po}
									<Select.Item value={po.id}>{po.poNumber} - {po.vendorName}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
							{#if $errors.purchaseOrderId}<Field.FieldError>{$errors.purchaseOrderId}</Field.FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="receivedDate">Received Date *</Field.FieldLabel>
							<DatePicker bind:value={$form.receivedDate} />
							{#if $errors.receivedDate}<Field.FieldError>{$errors.receivedDate}</Field.FieldError>{/if}
						</Field.Field>
					</div>
					<Field.Field>
						<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
						<Textarea id="notes" bind:value={$form.notes} rows="3" placeholder="Optional notes"></Textarea>
					</Field.Field>
				</Field.FieldGroup>

				<div class="flex items-center justify-end gap-3">
					<Button variant="outline" href="/proc/receiving-reports">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
						Create Receiving Report
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
