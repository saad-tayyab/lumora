<script lang="ts">
import { Command, LogOut, Menu, Moon, Settings, Sun, User } from '@lucide/svelte';
import { mode, toggleMode } from 'mode-watcher';
import { enhance } from '$app/forms';
import { page } from '$app/stores';
import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
import { Button } from '$lib/components/ui/button';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { Separator } from '$lib/components/ui/separator';
import * as Tooltip from '$lib/components/ui/tooltip';

let { onMenuClick, onSearchOpen }: { onMenuClick: () => void; onSearchOpen: () => void } = $props();
</script>

<header
	class="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<button
		onclick={onMenuClick}
		class="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
		aria-label="Toggle sidebar"
	>
		<Menu class="h-5 w-5" />
	</button>

	<button
		onclick={onSearchOpen}
		class="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
	>
		<span>Search...</span>
		<kbd
			class="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex"
		>
			<Command class="h-3 w-3" />K
		</kbd>
	</button>

	<div class="flex-1"></div>

	<div class="flex items-center gap-1">
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							variant="ghost"
							size="icon"
							{...props}
							onclick={toggleMode}
						>
							{#if mode.current === 'dark'}
								<Sun data-icon="inline-start" />
							{:else}
								<Moon data-icon="inline-start" />
							{/if}
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>Toggle theme</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>

		<Separator orientation="vertical" class="h-6" />

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="ghost" size="icon" {...props}>
						<Avatar class="h-8 w-8">
							<AvatarFallback class="text-xs">
								{($page.data.user?.name || 'U').charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-56">
				<DropdownMenu.Label>
					<div class="flex flex-col gap-1">
						<p class="text-sm font-medium">{$page.data.user?.name || 'User'}</p>
						<p class="text-xs text-muted-foreground">{$page.data.user?.email || ''}</p>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<a href="/settings" class="flex items-center gap-2">
						<Settings class="h-4 w-4" />
						Settings
					</a>
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<form method="POST" action="/logout" use:enhance class="w-full">
						<button type="submit" class="flex w-full items-center gap-2">
							<LogOut class="h-4 w-4" />
							Sign out
						</button>
					</form>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
