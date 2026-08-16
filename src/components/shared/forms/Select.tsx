'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  isError?: boolean;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, isError, leftIcon, disabled, children, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-[hsl(var(--muted-foreground))]">
            {leftIcon}
          </div>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'input-gem w-full appearance-none rounded-xl py-2.5 text-sm text-[hsl(var(--foreground))] transition-all duration-150 cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : 'pl-3.5',
            'pr-10',
            isError && 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20',
            className,
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute right-3.5 flex items-center justify-center text-[hsl(var(--muted-foreground))]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  },
);

Select.displayName = 'Select';
