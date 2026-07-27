<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { procApi, type ReceivingReport } from '$lib/api/proc';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import * as Card from '$lib/components/ui/card';
import { Badge } from '$lib/components/ui/badge';

let { data }: { data: PageData } = $props();
let report = $state<ReceivingReport | null>(data.report);
let loading = $state(false);

function rrStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'confirmed': return 'secondary';
    case 'draft': return 'outline';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function confirmReport() {
  loading = true;
  try {
    report = await procApi.receivingReports.confirm(report!.id);
    toast.success('Receiving report confirmed');
  } catch {
    toast.error('Failed to confirm receiving report');
  } finally {
    loading = false;
  }
}

async function rejectReport() {
  if (!window.confirm('Are you sure you want to reject this receiving report?')) return;
  loading = true;
  try {
    report = await procApi.receivingReports.reject(report!.id);
    toast.success('Receiving report rejected');
  } catch {
    toast.error('Failed to reject receiving report');
  } finally {
    loading = false;
  }
}

async function deleteReport() {
  if (!confirm('Are you sure you want to delete this receiving report?')) return;
  try {
    await procApi.receivingReports.delete(report!.id);
    toast.success('Receiving report deleted');
    goto('/proc/receiving-reports');
  } catch {
    toast.error('Failed to delete receiving report');
  }
}
</script>

<div class="mx-auto max-w-4xl flex flex-col gap-6">
  <nav class="mb-4 text-sm text-muted-foreground">
    <a href="/proc/receiving-reports" class="hover:underline">Receiving Reports</a>
    <span class="mx-2">/</span>
    <span class="text-foreground">{report?.reportNumber || ''}</span>
  </nav>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <Spinner class="size-8 text-primary" />
    </div>
  {:else if !report}
    <div class="py-12 text-center text-muted-foreground">Receiving report not found</div>
  {:else}
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{report.reportNumber}</h1>
          <Badge variant={rrStatusVariant(report.status)}>
            {formatStatus(report.status)}
          </Badge>
        </div>
        <p class="text-muted-foreground">Receiving report details</p>
      </div>
      <div class="flex items-center gap-2">
        {#if report.status === 'draft'}
          <a
            href="/proc/receiving-reports/{report.id}/edit"
            class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Edit
          </a>
          <button
            onclick={confirmReport}
            disabled={loading}
            class="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            onclick={rejectReport}
            disabled={loading}
            class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            Reject
          </button>
        {/if}
        {#if report.status === 'draft'}
          <button
            onclick={deleteReport}
            class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            Delete
          </button>
        {/if}
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="rounded-lg border bg-card p-6 shadow-sm lg:col-span-2">
        <Card.Header>
				<Card.Title>Report Details</Card.Title>
			</Card.Header>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div class="text-sm text-muted-foreground">Report Number</div>
            <div class="font-medium text-card-foreground">{report.reportNumber}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Purchase Order</div>
            <div class="font-medium text-card-foreground">
              <a href="/proc/purchase-orders/{report.purchaseOrderId}" class="text-primary hover:underline">
                {report.purchaseOrderNumber}
              </a>
            </div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Vendor</div>
            <div class="font-medium text-card-foreground">{report.vendorName}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Received Date</div>
            <div class="font-medium text-card-foreground">{formatDate(report.receivedDate)}</div>
          </div>
        </div>
        {#if report.notes}
          <div class="mt-4">
            <div class="text-sm text-muted-foreground">Notes</div>
            <div class="text-card-foreground">{report.notes}</div>
          </div>
        {/if}
      </div>

      <Card.Root class="shadow-sm"><Card.Content>
        <Card.Header>
				<Card.Title>Timeline</Card.Title>
			</Card.Header>
        <div class="flex flex-col gap-3 text-sm">
          <div>
            <div class="text-muted-foreground">Created</div>
            <div class="text-card-foreground">{formatDate(report.createdAt)}</div>
          </div>
          <div>
            <div class="text-muted-foreground">Last Updated</div>
            <div class="text-card-foreground">{formatDate(report.updatedAt)}</div>
          </div>
        </div>
      </Card.Content></Card.Root>
    </div>
  {/if}
</div>
