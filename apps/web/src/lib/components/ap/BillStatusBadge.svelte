<script lang="ts">
import type { BillStatus } from '$lib/types';

let { status }: { status: BillStatus } = $props();

const colorMap: Record<BillStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  partially_paid: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  voided: 'bg-gray-100 text-gray-800',
};
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {colorMap[status] ?? 'bg-gray-100 text-gray-800'}">
	{status.replace('_', ' ')}
</span>
