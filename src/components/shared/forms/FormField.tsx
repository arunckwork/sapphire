import React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  labelRight?: React.ReactNode;
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  required,
  error,
  helperText,
  className,
  labelRight,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || labelRight) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={id}
              className="block text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"
            >
              {label}
              {required && <span className="ml-1 text-rose-500">*</span>}
            </label>
          )}
          {labelRight && <div className="text-xs">{labelRight}</div>}
        </div>
      )}

      {children}

      {error ? (
        <p className="text-xs font-medium text-rose-500 animate-in fade-in slide-in-from-top-1 duration-150">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
