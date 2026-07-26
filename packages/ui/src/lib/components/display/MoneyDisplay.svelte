<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { formatCurrency } from '$lib/utils/format';

  interface Props {
    amount: string | number;
    currency?: string;
    class?: string;
  }

  let { amount, currency = 'USD', class: className }: Props = $props();

  let numericAmount = $derived(typeof amount === 'string' ? parseFloat(amount) || 0 : amount);
  let formatted = $derived(formatCurrency(numericAmount, currency));
  let isNegative = $derived(numericAmount < 0);
</script>

<span
  class={cn(
    'font-mono text-sm tabular-nums',
    isNegative && 'text-destructive',
    className,
  )}
  aria-label={`${formatted} ${currency}`}
>
  {formatted}
</span>
