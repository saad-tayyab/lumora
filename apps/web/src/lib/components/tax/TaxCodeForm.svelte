<script lang="ts">
import * as Select from '$lib/components/ui/select';
import { Checkbox } from '$lib/components/ui/checkbox';

let {
  taxCode,
  errors = {},
}: {
  taxCode?: {
    code: string;
    name: string;
    type: string;
    glAccountId: string;
    postingRule: string;
    isClaimable: boolean;
    description: string | null;
  };
  errors?: Record<string, string[]>;
} = $props();

let code = $state(taxCode?.code ?? '');
let name = $state(taxCode?.name ?? '');
let type = $state(taxCode?.type ?? 'sales_tax');
let glAccountId = $state(taxCode?.glAccountId ?? '');
let postingRule = $state(taxCode?.postingRule ?? 'output_liability');
let isClaimable = $state(taxCode?.isClaimable ?? false);
let description = $state(taxCode?.description ?? '');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="flex flex-col gap-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="code" class="block text-sm font-medium text-card-foreground">Code *</label>
				<input id="code" name="code" type="text" required maxlength="20" bind:value={code} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
				<input id="name" name="name" type="text" required maxlength="100" bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="type" class="block text-sm font-medium text-card-foreground">Type *</label>
			<Select.Root bind:value={type}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select type" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="sales_tax">Sales Tax</Select.Item>
					<Select.Item value="vat">VAT</Select.Item>
					<Select.Item value="gst">GST</Select.Item>
					<Select.Item value="excise">Excise</Select.Item>
					<Select.Item value="withholding">Withholding</Select.Item>
				</Select.Content>
			</Select.Root>
			</div>
			<div>
				<label for="postingRule" class="block text-sm font-medium text-card-foreground">Posting Rule</label>
			<Select.Root bind:value={postingRule}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select rule" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="output_liability">Output Liability</Select.Item>
					<Select.Item value="input_asset">Input Asset</Select.Item>
					<Select.Item value="expense">Expense</Select.Item>
				</Select.Content>
			</Select.Root>
			</div>
			<div>
				<label for="glAccountId" class="block text-sm font-medium text-card-foreground">GL Account ID *</label>
				<input id="glAccountId" name="glAccountId" type="text" required bind:value={glAccountId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-card-foreground">Description</label>
			<textarea id="description" name="description" rows="2" bind:value={description} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-2">
			<Checkbox id="isClaimable" bind:checked={isClaimable} />
			<label for="isClaimable" class="text-sm font-medium text-card-foreground">Is Claimable</label>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{taxCode ? 'Update Tax Code' : 'Create Tax Code'}{/if}
			</button>
			<a href="/tax/codes" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
