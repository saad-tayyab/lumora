<script lang="ts">
import { toast } from 'svelte-sonner';
import { financialApi } from '$lib/api/financial';
import { formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let closing = $state(false);

function statusVariants(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'closed': return 'outline';
    case 'open': return 'secondary';
    default: return 'outline';
  }
}

async function handleClose() {
	if (!data.fiscalYear || !confirm('Are you sure you want to close this fiscal year?')) return;
	closing = true;
	try {
		await financialApi.fiscalYears.close(data.fiscalYear.id);
		toast.success('Fiscal year closed');
		data.fiscalYear = { ...data.fiscalYear, status: 'closed' };
	} catch {
		toast.error('Failed to close fiscal year');
	} finally {
		closing = false;
	}
}
</script>

<div class="flex flex-col mx-auto max-w-4xl gap-6">
	<nav class="mb-4 text-sm text-muted-foreground">
		<a href="/financial/fiscal-years" class="hover:underline">Fiscal Years</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">{data.fiscalYear?.name || ''}</span>
	</nav>

	{#if data.fiscalYear}
		<div class="flex items-center justify-between">
			<div>
				<div class="flex items-center gap-3">
					<h1 class="text-3xl font-bold text-foreground">{data.fiscalYear.name}</h1>
					<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {statusVariant(data.fiscalYear.status) === "secondary" ? "secondary" : "outline"}">
						{data.fiscalYear.status}
					</span>
				</div>
				<p class="text-muted-foreground">Fiscal year details</p>
			</div>
			<div class="flex gap-2">
				<Button href="/financial/fiscal-years/{data.fiscalYear.id}/edit" variant="outline">Edit</Button>
				{#if data.fiscalYear.status === 'open'}
					<Button onclick={handleClose} disabled={closing} variant="destructive">
						{closing ? 'Closing...' : 'Close Period'}
					</Button>
				{/if}
			</div>
		</div>

		<Card.Root>
			<Card.Content>
				<Card.Header>
				<Card.Title>Fiscal Year Details</Card.Title>
			</Card.Header>
				<dl class="grid grid-cols-2 gap-4">
					<div>
						<dt class="text-sm text-muted-foreground">Name</dt>
						<dd class="mt-1 text-foreground">{data.fiscalYear.name}</dd>
					</div>
					<div>
						<dt class="text-sm text-muted-foreground">Status</dt>
						<dd class="mt-1">
							<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {statusVariant(data.fiscalYear.status) === "secondary" ? "secondary" : "outline"}">
								{data.fiscalYear.status}
							</span>
						</dd>
					</div>
					<div>
						<dt class="text-sm text-muted-foreground">Start Date</dt>
						<dd class="mt-1 text-foreground">{formatDate(data.fiscalYear.startDate)}</dd>
					</div>
					<div>
						<dt class="text-sm text-muted-foreground">End Date</dt>
						<dd class="mt-1 text-foreground">{formatDate(data.fiscalYear.endDate)}</dd>
					</div>
					<div>
						<dt class="text-sm text-muted-foreground">Created</dt>
						<dd class="mt-1 text-foreground">{formatDate(data.fiscalYear.createdAt)}</dd>
					</div>
				</dl>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Fiscal year not found</div>
	{/if}
</div>
