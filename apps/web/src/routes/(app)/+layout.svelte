<script lang="ts">
import type { Snippet } from 'svelte';
import { prefersReducedMotion } from 'svelte/motion';
import { fade } from 'svelte/transition';
import AppHeader from '$lib/components/layout/AppHeader.svelte';
import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';
import CommandPalette from '$lib/components/layout/CommandPalette.svelte';

let { data, children }: { data: { user?: { name?: string; email?: string } }; children: Snippet } =
  $props();

let sidebarOpen = $state(false);
let searchOpen = $state(false);
</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			searchOpen = !searchOpen;
		}
	}}
/>

<div class="flex min-h-screen bg-background">
	<AppSidebar bind:open={sidebarOpen} />

	<div class="flex-1 lg:pl-64">
		<AppHeader onMenuClick={() => (sidebarOpen = !sidebarOpen)} onSearchOpen={() => (searchOpen = true)} />

		<main class="p-6" in:fade={{ duration: prefersReducedMotion.current ? 0 : 200 }}>
			<div class="mb-4">
				<Breadcrumbs />
			</div>
			{@render children()}
		</main>
	</div>
</div>

<CommandPalette bind:open={searchOpen} />
