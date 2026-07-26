<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
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

<div class="space-y-6">
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
			<button
				type="submit"
				disabled={isLoading}
				class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if isLoading}
					Saving...
				{:else}
					Update Credit Note
				{/if}
			</button>
			<a
				href="/ar/credit-notes/{creditNote.id}"
				class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
