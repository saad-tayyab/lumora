<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

  interface Props {
    status: string;
    variant?: BadgeVariant;
    class?: string;
  }

  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  };

  let { status, variant = 'default', class: className }: Props = $props();
</script>

<span
  class={cn(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    variantStyles[variant],
    className,
  )}
  role="status"
>
  {status}
</span>
