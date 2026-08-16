'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, isError, disabled, type = 'text', ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-[hsl(var(--muted-foreground))]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            'input-gem w-full rounded-xl py-2.5 text-sm text-[hsl(var(--foreground))] transition-all duration-150',
            'placeholder:text-[hsl(var(--muted-foreground)/0.6)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : 'pl-3.5',
            rightIcon ? 'pr-10' : 'pr-3.5',
            isError && 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 flex items-center justify-center text-[hsl(var(--muted-foreground))]">
            {rightIcon}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
