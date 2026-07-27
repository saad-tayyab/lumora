<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: SelectPrimitive.ValueProps = $props();
</script>

<SelectPrimitive.Value bind:ref data-slot="select-value" class={className} {...restProps} />
