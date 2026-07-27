<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { TrendingUp, TrendingDown, Minus } from '@lucide/svelte';

	interface Props {
		title: string;
		value: string | number;
		subtitle?: string;
		trend?: number;
		icon?: any;
		class?: string;
	}

	let { title, value, subtitle, trend, icon, class: className }: Props = $props();
</script>

<div class={cn('rounded-lg border bg-card p-6 shadow-sm', className)}>
	<div class="flex items-center justify-between">
		<p class="text-sm font-medium text-muted-foreground">{title}</p>
		{#if icon}
			<icon class="h-4 w-4 text-muted-foreground" />
		{/if}
	</div>
	<div class="mt-2">
		<div class="text-3xl font-bold text-card-foreground">{value}</div>
		{#if trend !== undefined}
			<div class="mt-1 flex items-center gap-1 text-xs">
				{#if trend > 0}
					<TrendingUp class="h-3 w-3 text-green-500" />
					<span class="text-green-500">+{trend}%</span>
				{:else if trend < 0}
					<TrendingDown class="h-3 w-3 text-red-500" />
					<span class="text-red-500">{trend}%</span>
				{:else}
					<Minus class="h-3 w-3 text-muted-foreground" />
					<span class="text-muted-foreground">0%</span>
				{/if}
				<span class="text-muted-foreground">vs last period</span>
			</div>
		{/if}
		{#if subtitle}
			<p class="mt-1 text-xs text-muted-foreground">{subtitle}</p>
		{/if}
	</div>
</div>
