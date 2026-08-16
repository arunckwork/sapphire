import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'sapphire'
  | 'ruby'
  | 'emerald'
  | 'gold'
  | 'amethyst'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  leftIcon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border border-[hsl(var(--border))]',
  sapphire:
    'bg-[hsl(var(--gem-sapphire)/0.12)] text-[hsl(var(--gem-sapphire))] border border-[hsl(var(--gem-sapphire)/0.25)]',
  ruby:
    'bg-[hsl(var(--gem-ruby)/0.12)] text-[hsl(var(--gem-ruby))] border border-[hsl(var(--gem-ruby)/0.25)]',
  emerald:
    'bg-[hsl(var(--gem-emerald)/0.12)] text-[hsl(var(--gem-emerald))] border border-[hsl(var(--gem-emerald)/0.25)]',
  gold:
    'bg-[hsl(var(--gem-gold)/0.12)] text-[hsl(var(--gem-gold))] border border-[hsl(var(--gem-gold)/0.25)]',
  amethyst:
    'bg-[hsl(var(--gem-amethyst)/0.12)] text-[hsl(var(--gem-amethyst))] border border-[hsl(var(--gem-amethyst)/0.25)]',
  success:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  warning:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  error:
    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  neutral:
    'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]',
  outline:
    'bg-transparent text-[hsl(var(--foreground))] border border-[hsl(var(--border))]',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[hsl(var(--muted-foreground))]',
  sapphire: 'bg-[hsl(var(--gem-sapphire))]',
  ruby: 'bg-[hsl(var(--gem-ruby))]',
  emerald: 'bg-[hsl(var(--gem-emerald))]',
  gold: 'bg-[hsl(var(--gem-gold))]',
  amethyst: 'bg-[hsl(var(--gem-amethyst))]',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
  neutral: 'bg-[hsl(var(--muted-foreground))]',
  outline: 'bg-[hsl(var(--foreground))]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px] font-medium gap-1 rounded-md',
  md: 'px-2.5 py-1 text-xs font-semibold gap-1.5 rounded-lg',
  lg: 'px-3 py-1.5 text-sm font-semibold gap-2 rounded-lg',
};

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  leftIcon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center tracking-wide transition-colors select-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('inline-block h-1.5 w-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
    </span>
  );
}
