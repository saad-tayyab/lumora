<script lang="ts">
	import { cn } from '$lib/utils/cn';

	const variantStyles: Record<string, string> = {
		default: 'bg-secondary text-secondary-foreground',
		success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		voided: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		reconciled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		unreconciled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
	};

	interface Props {
		status: string;
		class?: string;
	}

	let { status, class: className }: Props = $props();

	function getVariant(status: string): string {
		const lower = status.toLowerCase().replace(/[_ ]/g, '-');
		return variantStyles[lower] || variantStyles.default;
	}

	function formatLabel(status: string): string {
		return status.replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	}
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
		getVariant(status),
		className,
	)}
>
	{formatLabel(status)}
</span>
