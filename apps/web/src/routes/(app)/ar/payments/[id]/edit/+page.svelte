<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import * as Field from '$lib/components/ui/field';
import { Button } from '$lib/components/ui/button';
import PaymentForm from '$lib/components/ar/PaymentForm.svelte';
import type { ActionData, PageData } from './$types';

let { form, data }: { form: ActionData; data: PageData } = $props();
let payment = $derived(data.payment);
let customers = $derived(data.customers);
let isLoading = $state(false);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="flex flex-col gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/ar/payments" class="hover:underline">Payments</a>
			<span>/</span>
			<a href="/ar/payments/{payment.id}" class="hover:underline">{payment.paymentNumber}</a>
			<span>/</span>
			<span>Edit</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Edit Payment {payment.paymentNumber}</h1>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			isLoading = true;
			return async ({ update }) => {
				isLoading = false;
				await update();
			};
		}}
	>
		<PaymentForm {customers} />

		<div class="mt-4 flex items-center gap-3">
			<Button type="submit" disabled={isLoading}>
				{#if isLoading}Saving...{:else}Update Payment{/if}
			</Button>
			<Button variant="outline" href="/ar/payments/{payment.id}">Cancel</Button>
		</div>
	</form>
</div>
