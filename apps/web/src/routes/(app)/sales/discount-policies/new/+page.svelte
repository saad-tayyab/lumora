<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';
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
			goto('/sales/discount-policies');
		}
	}
});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Discount Policy</h1>
		<p class="text-muted-foreground">Create a new discount policy</p>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<h2 class="text-lg font-semibold text-card-foreground">Policy Details</h2>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<label for="name" class="mb-1 block text-sm font-medium text-card-foreground">Name *</label>
						<Input id="name" bind:value={$form.name} placeholder="Policy name" />
						{#if $errors.name}<p class="text-xs text-destructive">{$errors.name}</p>{/if}
					</div>
					<div class="space-y-2">
						<label for="type" class="mb-1 block text-sm font-medium text-card-foreground">Type *</label>
						<select id="type" bind:value={$form.type} class="w-full rounded-md border bg-background px-3 py-2 text-sm">
							<option value="percentage">Percentage</option>
							<option value="fixed_amount">Fixed Amount</option>
							<option value="tiered">Tiered</option>
						</select>
					</div>
					<div class="space-y-2">
						<label for="value" class="mb-1 block text-sm font-medium text-card-foreground">Value *</label>
						<Input id="value" type="number" bind:value={$form.value} min="0" step="0.01" />
						<p class="mt-1 text-xs text-muted-foreground">
							{$form.type === 'percentage' ? 'Enter as decimal (e.g., 0.10 for 10%)' : 'Enter amount'}
						</p>
						{#if $errors.value}<p class="text-xs text-destructive">{$errors.value}</p>{/if}
					</div>
					<div class="space-y-2">
						<label for="minQuantity" class="mb-1 block text-sm font-medium text-card-foreground">Minimum Quantity</label>
						<Input id="minQuantity" type="number" bind:value={$form.minQuantity} min="0" />
					</div>
					<div class="space-y-2">
						<label for="minAmount" class="mb-1 block text-sm font-medium text-card-foreground">Minimum Amount</label>
						<Input id="minAmount" type="number" bind:value={$form.minAmount} min="0" step="0.01" />
					</div>
					<div class="space-y-2">
						<label for="maxDiscountAmount" class="mb-1 block text-sm font-medium text-card-foreground">Max Discount Amount</label>
						<Input id="maxDiscountAmount" type="number" bind:value={$form.maxDiscountAmount} min="0" step="0.01" />
					</div>
					<div class="space-y-2">
						<label for="startDate" class="mb-1 block text-sm font-medium text-card-foreground">Start Date *</label>
						<DatePicker bind:value={$form.startDate} />
						{#if $errors.startDate}<p class="text-xs text-destructive">{$errors.startDate}</p>{/if}
					</div>
					<div class="space-y-2">
						<label for="endDate" class="mb-1 block text-sm font-medium text-card-foreground">End Date</label>
						<DatePicker bind:value={$form.endDate} />
					</div>
					<div class="flex items-center gap-2">
						<input id="isActive" type="checkbox" bind:checked={$form.isActive} class="h-4 w-4 rounded border" />
						<label for="isActive" class="text-sm font-medium text-card-foreground">Active</label>
					</div>
				</div>

				<div class="flex items-center justify-end gap-3">
					<Button variant="outline" href="/sales/discount-policies">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
						Create Discount Policy
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
