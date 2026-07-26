<script lang="ts">
import type { InvoiceStatus } from '$lib/types';

let { status }: { status: InvoiceStatus } = $props();

const colorMap: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  voided: 'bg-gray-100 text-gray-800',
};
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {colorMap[status] ?? 'bg-gray-100 text-gray-800'}">
	{status}
</span>
