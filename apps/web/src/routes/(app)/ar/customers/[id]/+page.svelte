<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { deleteCustomer } from '$lib/api/ar';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Badge } from '$lib/components/ui/badge';
import * as Card from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let customer = $derived(data.customer);
let invoices = $derived(data.invoices);
let payments = $derived(data.payments);

function invStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'draft': return 'outline';
    case 'sent': return 'default';
    case 'paid': return 'secondary';
    case 'overdue': return 'destructive';
    default: return 'outline';
  }
}

const totalOutstanding = $derived(
  invoices
    .filter((i: { status: string }) => i.status !== 'paid' && i.status !== 'voided')
    .reduce((sum: number, i: { balanceDue: string }) => sum + parseFloat(i.balanceDue || '0'), 0),
);

async function handleDelete() {
  if (!confirm(`Delete customer "${customer.name}"?`)) return;
  try {
    await deleteCustomer(customer.id);
    toast.success('Customer deleted');
    goto('/ar/customers');
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete customer');
  }
}
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<a href="/ar/customers" class="hover:underline">Customers</a>
				<span>/</span>
				<span>{customer.name}</span>
			</div>
			<h1 class="mt-2 text-3xl font-bold text-foreground">{customer.name}</h1>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" href="/ar/customers/{customer.id}/edit">
				Edit
			</Button>
			<Button variant="destructive" onclick={handleDelete}>
				Delete
			</Button>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="flex flex-col gap-6 lg:col-span-2">
			<Card.Root>
				<Card.Content>
					<Card.Header>
				<Card.Title>Customer Details</Card.Title>
			</Card.Header>
					<dl class="grid gap-4 md:grid-cols-2">
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Email</dt>
							<dd class="mt-1 text-sm text-card-foreground">{customer.email || '—'}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Phone</dt>
							<dd class="mt-1 text-sm text-card-foreground">{customer.phone || '—'}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Payment Terms</dt>
							<dd class="mt-1 text-sm text-card-foreground">{customer.paymentTerms}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Credit Limit</dt>
							<dd class="mt-1 text-sm text-card-foreground">
								{customer.creditLimit ? formatCurrency(customer.creditLimit) : '—'}
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Status</dt>
							<dd class="mt-1">
							<Badge variant={customer.isActive ? 'secondary' : 'outline'}>
								{customer.isActive ? 'Active' : 'Inactive'}
							</Badge>
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Created</dt>
							<dd class="mt-1 text-sm text-card-foreground">{formatDate(customer.createdAt)}</dd>
						</div>
					</dl>

					{#if customer.addressLine1 || customer.city || customer.state}
						<div class="mt-4 border-t pt-4">
							<dt class="text-sm font-medium text-muted-foreground">Address</dt>
							<dd class="mt-1 text-sm text-card-foreground">
								{#if customer.addressLine1}{customer.addressLine1}<br />{/if}
								{#if customer.addressLine2}{customer.addressLine2}<br />{/if}
								{#if customer.city || customer.state || customer.postalCode}
									{customer.city}{customer.city && customer.state ? ', ' : ''}{customer.state}
									{customer.postalCode}
								{/if}
								{#if customer.country}<br />{customer.country}{/if}
							</dd>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content>
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-lg font-semibold text-card-foreground">Invoices</h2>
						<a
							href="/ar/invoices/new?customerId={customer.id}"
							class="text-sm text-primary hover:underline"
						>
							New Invoice
						</a>
					</div>
					{#if invoices.length === 0}
						<p class="text-sm text-muted-foreground">No invoices.</p>
					{:else}
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b text-left">
									<th class="pb-2 font-medium text-muted-foreground">Number</th>
									<th class="pb-2 font-medium text-muted-foreground">Date</th>
									<th class="pb-2 font-medium text-muted-foreground">Total</th>
									<th class="pb-2 font-medium text-muted-foreground">Balance</th>
									<th class="pb-2 font-medium text-muted-foreground">Status</th>
								</tr>
							</thead>
							<tbody>
								{#each invoices as inv}
									<tr class="border-b last:border-b-0">
										<td class="py-2">
											<a href="/ar/invoices/{inv.id}" class="text-primary hover:underline">
												{inv.invoiceNumber}
											</a>
										</td>
										<td class="py-2 text-muted-foreground">{formatDate(inv.issueDate)}</td>
										<td class="py-2">{formatCurrency(inv.totalAmount)}</td>
										<td class="py-2">{formatCurrency(inv.balanceDue)}</td>
										<td class="py-2">
											<Badge variant={invStatusVariant(inv.status)}>
												{inv.status}
											</Badge>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<div class="flex flex-col gap-6">
			<Card.Root>
				<Card.Content>
					<Card.Header>
				<Card.Title>Summary</Card.Title>
			</Card.Header>
					<dl class="flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<dt class="text-sm text-muted-foreground">Outstanding</dt>
							<dd class="text-sm font-medium text-card-foreground">
								{formatCurrency(totalOutstanding)}
							</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt class="text-sm text-muted-foreground">Total Invoices</dt>
							<dd class="text-sm font-medium text-card-foreground">{invoices.length}</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt class="text-sm text-muted-foreground">Total Payments</dt>
							<dd class="text-sm font-medium text-card-foreground">{payments.length}</dd>
						</div>
					</dl>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content>
					<Card.Header>
				<Card.Title>Recent Payments</Card.Title>
			</Card.Header>
					{#if payments.length === 0}
						<p class="text-sm text-muted-foreground">No payments.</p>
					{:else}
						<div class="flex flex-col gap-3">
							{#each payments.slice(0, 5) as pay}
								<div class="flex items-center justify-between text-sm">
									<div>
										<div class="font-medium text-card-foreground">{pay.paymentNumber}</div>
										<div class="text-xs text-muted-foreground">{formatDate(pay.paymentDate)}</div>
									</div>
									<div class="font-medium text-card-foreground">{formatCurrency(pay.amount)}</div>
								</div>
							{/each}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
