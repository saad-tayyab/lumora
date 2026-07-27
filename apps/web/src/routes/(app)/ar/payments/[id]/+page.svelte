<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let payment = $derived(data.payment);
let customer = $derived(data.customer);

const methodLabels: Record<string, string> = {
  cash: 'Cash',
  check: 'Check',
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  other: 'Other',
};
</script>

<div class="space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/ar/payments" class="hover:underline">Payments</a>
			<span>/</span>
			<span>{payment.paymentNumber}</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">
			Payment {payment.paymentNumber}
		</h1>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="space-y-6 lg:col-span-2">
			<Card>
				<CardContent>
					<div class="flex items-start justify-between">
						<div>
							<h2 class="text-lg font-semibold text-card-foreground">Payment Details</h2>
							{#if customer}
								<p class="mt-1 text-sm text-muted-foreground">
									<a href="/ar/customers/{customer.id}" class="text-primary hover:underline">
										{customer.name}
									</a>
								</p>
							{/if}
						</div>
					</div>

					<dl class="mt-4 grid gap-4 md:grid-cols-2">
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Payment Number</dt>
							<dd class="mt-1 text-sm text-card-foreground">{payment.paymentNumber}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Amount</dt>
							<dd class="mt-1 text-sm font-medium text-card-foreground">
								{formatCurrency(payment.amount)}
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Payment Method</dt>
							<dd class="mt-1 text-sm text-card-foreground">
								{methodLabels[payment.paymentMethod] || payment.paymentMethod}
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Payment Date</dt>
							<dd class="mt-1 text-sm text-card-foreground">{formatDate(payment.paymentDate)}</dd>
						</div>
						{#if payment.referenceNumber}
							<div>
								<dt class="text-sm font-medium text-muted-foreground">Reference Number</dt>
								<dd class="mt-1 text-sm text-card-foreground">{payment.referenceNumber}</dd>
							</div>
						{/if}
						{#if payment.currency}
							<div>
								<dt class="text-sm font-medium text-muted-foreground">Currency</dt>
								<dd class="mt-1 text-sm text-card-foreground">{payment.currency}</dd>
							</div>
						{/if}
					</dl>
				</CardContent>
			</Card>

			{#if payment.notes}
				<Card>
					<CardContent>
						<h2 class="mb-2 text-lg font-semibold text-card-foreground">Notes</h2>
						<p class="text-sm text-muted-foreground">{payment.notes}</p>
					</CardContent>
				</Card>
			{/if}
		</div>

		<div class="space-y-6">
			<Card>
				<CardContent>
					<h2 class="mb-4 text-lg font-semibold text-card-foreground">Summary</h2>
					<dl class="space-y-3">
						<div class="flex items-center justify-between">
							<dt class="text-sm text-muted-foreground">Payment Number</dt>
							<dd class="text-sm text-card-foreground">{payment.paymentNumber}</dd>
						</div>
						<div class="flex items-center justify-between border-t pt-3">
							<dt class="text-sm font-medium text-card-foreground">Total Amount</dt>
							<dd class="text-sm font-medium text-card-foreground">
								{formatCurrency(payment.amount)}
							</dd>
						</div>
					</dl>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
