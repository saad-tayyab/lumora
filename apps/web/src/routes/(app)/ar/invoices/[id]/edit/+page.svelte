<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import * as Field from '$lib/components/ui/field';
import { Button } from '$lib/components/ui/button';
import InvoiceForm from '$lib/components/ar/InvoiceForm.svelte';
import type { ActionData, PageData } from './$types';

let { form, data }: { form: ActionData; data: PageData } = $props();
let invoice = $derived(data.invoice);
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
			<a href="/ar/invoices" class="hover:underline">Invoices</a>
			<span>/</span>
			<a href="/ar/invoices/{invoice.id}" class="hover:underline">{invoice.invoiceNumber}</a>
			<span>/</span>
			<span>Edit</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Edit Invoice {invoice.invoiceNumber}</h1>
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
		<InvoiceForm {invoice} {customers} />

		<div class="mt-4 flex items-center gap-3">
			<Button type="submit" disabled={isLoading}>
				{#if isLoading}Saving...{:else}Update Invoice{/if}
			</Button>
			<Button variant="outline" href="/ar/invoices/{invoice.id}">Cancel</Button>
		</div>
	</form>
</div>
