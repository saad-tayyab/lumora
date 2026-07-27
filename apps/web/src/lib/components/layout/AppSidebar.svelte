<script lang="ts">
	import { page } from '$app/stores';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Root as ScrollArea } from '$lib/components/ui/scroll-area';
	import { Separator } from '$lib/components/ui/separator';
	import { navGroups, dashboardItem, type NavItem } from '$lib/config/navigation';
	import { cn } from '$lib/utils/cn';
	import { ChevronRight } from '@lucide/svelte';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let expandedSections = $state<Set<string>>(new Set());

	function toggleSection(label: string) {
		if (expandedSections.has(label)) {
			expandedSections.delete(label);
		} else {
			expandedSections.add(label);
		}
		expandedSections = new Set(expandedSections);
	}

	function isActive(href: string): boolean {
		const path = $page.url.pathname;
		return path === href || path.startsWith(href + '/');
	}

	function closeMobile() {
		open = false;
	}
</script>

{#snippet sidebarContent()}
	<div class="flex h-full flex-col">
		<div class="flex h-14 items-center border-b px-4">
			<a href="/dashboard" class="text-lg font-bold" onclick={closeMobile}>
				Lumora <span class="text-primary">ERP</span>
			</a>
		</div>

		<ScrollArea class="flex-1 min-h-0 py-2">
			<nav class="space-y-1 px-2">
				<a
					href={dashboardItem.href}
					class={cn(
						'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
						isActive(dashboardItem.href)
							? 'bg-accent text-accent-foreground'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
					)}
					onclick={closeMobile}
				>
					{#if dashboardItem.icon}
						<dashboardItem.icon class="h-4 w-4 shrink-0" />
					{/if}
					{dashboardItem.label}
				</a>

				{#each navGroups as group}
					<div class="mt-4">
						<div class="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{group.label}
						</div>
						<div class="mt-1 space-y-0.5">
							{#each group.items as item}
								{#if item.children && item.children.length > 0}
									<button
										type="button"
										class={cn(
											'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
											'hover:bg-accent hover:text-accent-foreground',
										)}
										onclick={() => toggleSection(item.label)}
									>
										{#if item.icon}
											<item.icon class="h-4 w-4 shrink-0" />
										{/if}
										<span class="flex-1 text-left">{item.label}</span>
										<ChevronRight
											class={cn(
												'h-4 w-4 shrink-0 transition-transform',
												expandedSections.has(item.label) && 'rotate-90',
											)}
										/>
									</button>
									{#if expandedSections.has(item.label)}
										<div class="ml-6 space-y-0.5 border-l pl-3">
											{#each item.children as child}
												<a
													href={child.href}
													class={cn(
														'block rounded-md px-3 py-1.5 text-sm transition-colors',
														isActive(child.href)
															? 'bg-accent text-accent-foreground font-medium'
															: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
													)}
													onclick={closeMobile}
												>
													{child.label}
												</a>
											{/each}
										</div>
									{/if}
								{:else}
									<a
										href={item.href}
										class={cn(
											'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
											isActive(item.href)
												? 'bg-accent text-accent-foreground'
												: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
										)}
										onclick={closeMobile}
									>
										{#if item.icon}
											<item.icon class="h-4 w-4 shrink-0" />
										{/if}
										<span class="flex-1">{item.label}</span>
										{#if item.badge}
											<span
												class="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
											>
												{item.badge}
											</span>
										{/if}
									</a>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</nav>
		</ScrollArea>

		<Separator />

		<div class="p-4">
			<div class="text-sm font-medium">{$page.data.user?.name || 'User'}</div>
			<div class="text-xs text-muted-foreground">{$page.data.user?.email || ''}</div>
		</div>
	</div>
{/snippet}

<!-- Desktop Sidebar -->
<aside
	class="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card lg:overflow-hidden"
>
	{@render sidebarContent()}
</aside>

<!-- Mobile Sidebar (Sheet) -->
<Sheet.Root bind:open>
	<Sheet.Content side="left" class="w-64 p-0" showCloseButton={false}>
		{@render sidebarContent()}
	</Sheet.Content>
</Sheet.Root>
