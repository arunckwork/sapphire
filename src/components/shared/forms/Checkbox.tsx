'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, disabled, id, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'flex items-start gap-2.5 cursor-pointer select-none text-sm',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'peer h-4 w-4 shrink-0 appearance-none rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))]',
              'checked:bg-[hsl(var(--primary))] checked:border-[hsl(var(--primary))]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1',
              'transition-all duration-150 cursor-pointer',
              'disabled:cursor-not-allowed',
            )}
            {...props}
          />
          <svg
            className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="font-medium text-[hsl(var(--foreground))]">{label}</span>}
            {description && <span className="text-xs text-[hsl(var(--muted-foreground))]">{description}</span>}
          </div>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
