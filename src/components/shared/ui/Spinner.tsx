import React from 'react';
import { cn } from '@/lib/utils';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'white' | 'muted' | 'gem';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-3.5 w-3.5 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-12 w-12 border-4',
};

const variantClasses: Record<SpinnerVariant, string> = {
  primary: 'border-[hsl(var(--primary)/0.2)] border-t-[hsl(var(--primary))]',
  white: 'border-white/20 border-t-white',
  muted: 'border-[hsl(var(--muted-foreground)/0.2)] border-t-[hsl(var(--muted-foreground))]',
  gem: 'border-[hsl(var(--gem-sapphire)/0.2)] border-t-[hsl(var(--gem-sapphire))]',
};

export function Spinner({ size = 'md', variant = 'primary', className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('inline-block shrink-0 animate-spin rounded-full', sizeClasses[size], variantClasses[variant], className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
