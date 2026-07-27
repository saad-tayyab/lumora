<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import * as Field from '$lib/components/ui/field';
import { Button } from '$lib/components/ui/button';
import CreditNoteForm from '$lib/components/ar/CreditNoteForm.svelte';
import type { ActionData, PageData } from './$types';

let { form, data }: { form: ActionData; data: PageData } = $props();
let creditNote = $derived(data.creditNote);
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
			<a href="/ar/credit-notes" class="hover:underline">Credit Notes</a>
			<span>/</span>
			<a href="/ar/credit-notes/{creditNote.id}" class="hover:underline">{creditNote.creditNoteNumber}</a>
			<span>/</span>
			<span>Edit</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Edit Credit Note {creditNote.creditNoteNumber}</h1>
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
		<CreditNoteForm {customers} />

		<div class="mt-4 flex items-center gap-3">
			<Button type="submit" disabled={isLoading}>
				{#if isLoading}Saving...{:else}Update Credit Note{/if}
			</Button>
			<Button variant="outline" href="/ar/credit-notes/{creditNote.id}">Cancel</Button>
		</div>
	</form>
</div>
