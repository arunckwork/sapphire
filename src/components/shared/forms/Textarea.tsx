'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isError, disabled, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          'input-gem w-full rounded-xl p-3 text-sm text-[hsl(var(--foreground))] transition-all duration-150',
          'placeholder:text-[hsl(var(--muted-foreground)/0.6)] resize-y',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isError && 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
