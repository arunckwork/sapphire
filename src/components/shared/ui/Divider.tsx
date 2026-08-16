import React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'gradient' | 'dashed';
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export function Divider({
  variant = 'gradient',
  orientation = 'horizontal',
  label,
  className,
  ...props
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'inline-block h-full min-h-[1em] w-px self-stretch',
          variant === 'gradient' && 'bg-gradient-to-b from-transparent via-[hsl(var(--gem-sapphire)/0.3)] to-transparent',
          variant === 'subtle' && 'bg-[hsl(var(--border))]',
          variant === 'dashed' && 'border-l border-dashed border-[hsl(var(--border))]',
          className,
        )}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div className={cn('relative flex items-center py-2', className)} {...props}>
        <div className="grow border-t border-[hsl(var(--border))]" />
        <span className="shrink mx-4 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {label}
        </span>
        <div className="grow border-t border-[hsl(var(--border))]" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full',
        variant === 'gradient' && 'h-px bg-gradient-to-r from-transparent via-[hsl(var(--gem-sapphire)/0.3)] to-transparent',
        variant === 'subtle' && 'h-px bg-[hsl(var(--border))]',
        variant === 'dashed' && 'border-t border-dashed border-[hsl(var(--border))]',
        className,
      )}
      {...props}
    />
  );
}
