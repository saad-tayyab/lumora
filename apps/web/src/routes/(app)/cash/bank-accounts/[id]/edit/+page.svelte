<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Button } from '$lib/components/ui/button';
import BankAccountForm from '$lib/components/cash/BankAccountForm.svelte';
import type { ActionData, PageData } from './$types';

let { form, data }: { form: ActionData; data: PageData } = $props();
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
			<a href="/cash/bank-accounts" class="hover:underline">Bank Accounts</a>
			<span>/</span>
			<a href="/cash/bank-accounts/{data.account.id}" class="hover:underline">{data.account.name}</a>
			<span>/</span>
			<span>Edit</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Edit Bank Account</h1>
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
		<BankAccountForm bankAccount={data.account} />

		<div class="mt-4 flex items-center gap-3">
			<Button type="submit" disabled={isLoading}>
				{#if isLoading}Saving...{:else}Update Account{/if}
			</Button>
			<Button variant="outline" href="/cash/bank-accounts/{data.account.id}">Cancel</Button>
		</div>
	</form>
</div>
